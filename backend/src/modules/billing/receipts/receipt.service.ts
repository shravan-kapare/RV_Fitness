import { prisma } from '../../../config/database';
import { UserRole, PaymentStatus } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../../shared/errors';
import { formatCurrency, amountInWords } from '../../../shared/financial';
import { SettingsService } from '../settings/settings.service';
import PDFDocument from 'pdfkit';

export class ReceiptService {
  public static serializeReceipt(receipt: any): any {
    if (!receipt) return receipt;

    const amountPaisa = Number(receipt.amountPaisa);
    const prevPaidPaisa = receipt.previousPaymentsPaisa !== undefined ? Number(receipt.previousPaymentsPaisa) : 0;
    const remBalancePaisa = receipt.remainingBalancePaisa !== undefined ? Number(receipt.remainingBalancePaisa) : 0;
    const invTotalPaisa = receipt.invoice?.totalPaisa !== undefined ? Number(receipt.invoice.totalPaisa) : amountPaisa;

    return {
      ...receipt,
      amountPaisa,
      formattedAmount: formatCurrency(receipt.amountPaisa),
      amountWords: amountInWords(receipt.amountPaisa),
      previousPaymentsPaisa: prevPaidPaisa,
      formattedPreviousPayments: formatCurrency(prevPaidPaisa),
      remainingBalancePaisa: remBalancePaisa,
      formattedRemainingBalance: formatCurrency(remBalancePaisa),
      invoiceTotalPaisa: invTotalPaisa,
      formattedInvoiceTotal: formatCurrency(invTotalPaisa),
      payment: receipt.payment
        ? {
            ...receipt.payment,
            amountPaisa: Number(receipt.payment.amountPaisa),
          }
        : undefined,
      invoice: receipt.invoice
        ? {
            ...receipt.invoice,
            subtotalPaisa: Number(receipt.invoice.subtotalPaisa),
            taxPaisa: Number(receipt.invoice.taxPaisa),
            discountPaisa: Number(receipt.invoice.discountPaisa),
            totalPaisa: Number(receipt.invoice.totalPaisa),
            paidPaisa: Number(receipt.invoice.paidPaisa),
            items: receipt.invoice.items?.map((item: any) => ({
              ...item,
              unitPricePaisa: Number(item.unitPricePaisa),
              taxPaisa: Number(item.taxPaisa),
              discountPaisa: Number(item.discountPaisa),
              totalPaisa: Number(item.totalPaisa),
            })),
          }
        : undefined,
    };
  }

  public static async findById(id: string, user?: { id: string; role: UserRole }) {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        payment: true,
        invoice: {
          include: {
            items: true,
            payments: {
              where: { status: PaymentStatus.CONFIRMED },
              orderBy: { paymentDate: 'asc' },
            },
          },
        },
        member: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
            memberships: {
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        issuer: { select: { fullName: true } },
      },
    });

    if (!receipt) throw new NotFoundError('Receipt not found');

    if (user && user.role === UserRole.TRAINER) {
      throw new ForbiddenError('Trainers do not have access to billing operations');
    }

    if (user && user.role === UserRole.MEMBER && receipt.member.userId !== user.id) {
      throw new ForbiddenError('You can only access your own payment receipts');
    }

    // Compute previous payments made on this invoice prior to this receipt
    const allConfirmedPayments = receipt.invoice?.payments || [];
    const thisPaymentTime = new Date(receipt.payment?.paymentDate || receipt.issuedAt).getTime();

    let previousPaymentsPaisa = 0n;
    for (const p of allConfirmedPayments) {
      if (p.id !== receipt.paymentId) {
        const pTime = new Date(p.paymentDate).getTime();
        if (pTime < thisPaymentTime || (pTime === thisPaymentTime && p.id < receipt.paymentId)) {
          previousPaymentsPaisa += p.amountPaisa;
        }
      }
    }

    const currentPaymentPaisa = receipt.amountPaisa;
    const cumulativePaidPaisa = previousPaymentsPaisa + currentPaymentPaisa;
    const invoiceTotalPaisa = receipt.invoice?.totalPaisa || currentPaymentPaisa;
    const remainingBalancePaisa =
      invoiceTotalPaisa > cumulativePaidPaisa ? invoiceTotalPaisa - cumulativePaidPaisa : 0n;

    const latestMembership = receipt.member.memberships?.[0];

    const extendedData = {
      ...receipt,
      previousPaymentsPaisa,
      currentPaymentPaisa,
      cumulativePaidPaisa,
      remainingBalancePaisa,
      membership: latestMembership
        ? {
            planName:
              latestMembership.plan?.name ||
              (latestMembership.planSnapshot as any)?.name ||
              'Gym Membership',
            startDate: latestMembership.startDate,
            endDate: latestMembership.endDate,
            status: latestMembership.status,
          }
        : null,
    };

    return this.serializeReceipt(extendedData);
  }

  public static async findAll(
    filters: {
      page?: number;
      limit?: number;
      memberId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    },
    user?: { id: string; role: UserRole }
  ) {
    if (user && user.role === UserRole.TRAINER) {
      throw new ForbiddenError('Trainers do not have access to billing operations');
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (user && user.role === UserRole.MEMBER) {
      where.member = { userId: user.id };
    } else if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.issuedAt = {};
      if (filters.dateFrom) where.issuedAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.issuedAt.lte = new Date(filters.dateTo);
    }

    if (filters.search) {
      where.OR = [
        { receiptNumber: { contains: filters.search } },
        { invoice: { invoiceNumber: { contains: filters.search } } },
        { member: { memberCode: { contains: filters.search } } },
        { member: { user: { fullName: { contains: filters.search } } } },
      ];
    }

    const [total, receipts] = await Promise.all([
      prisma.receipt.count({ where }),
      prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          payment: { select: { method: true, referenceNumber: true, paymentDate: true } },
          invoice: { select: { invoiceNumber: true, totalPaisa: true } },
          member: { include: { user: { select: { fullName: true } } } },
        },
      }),
    ]);

    return {
      receipts: receipts.map((r) => this.serializeReceipt(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generates a professional, authoritative A4 portrait payment receipt PDF document.
   */
  public static async generatePdfBuffer(id: string, user?: { id: string; role: UserRole }): Promise<Buffer> {
    const receipt = await this.findById(id, user);
    const settings = await SettingsService.getAll();

    return new Promise((resolve, reject) => {
      // Standard A4: 595.28 x 841.89 points
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 36, bottom: 36, left: 40, right: 40 },
        info: {
          Title: `Payment Receipt — ${receipt.receiptNumber}`,
          Author: 'RV Fitness Narsobawadi',
          Subject: 'Official Payment Receipt',
          Keywords: 'Receipt, Payment, RV Fitness, Gym, Narsobawadi',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Design Palette
      const brandDark = '#111114';
      const brandGold = '#B45309';
      const accentYellow = '#FFC21A';
      const textPrimary = '#111827';
      const textSecondary = '#4B5563';
      const borderStroke = '#E5E7EB';
      const bgSubtle = '#F9FAFB';

      const leftMargin = 40;
      const pageWidth = 515; // 595.28 - 80

      // 1. Top Decorative Brand Bar
      doc.rect(leftMargin, 36, pageWidth, 5).fill(accentYellow);

      // 2. Header Container
      let currentY = 52;

      // Brand Logo Monogram (Vector Badge)
      doc.roundedRect(leftMargin, currentY, 44, 44, 6).fill(brandDark);
      doc.rect(leftMargin, currentY + 40, 44, 4).fill(accentYellow);
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#FFFFFF')
        .text('RV', leftMargin, currentY + 11, { width: 44, align: 'center' });

      // Gym Legal Entity Details
      const gymName = settings.gym_name || 'RV FITNESS';
      const gymAddress =
        settings.gym_address ||
        'Near Datta Mandir, Main Road, Narsobawadi, Taluka Shirol, Kolhapur, Maharashtra 416104';
      const gymPhone = settings.gym_phone || '+91 98765 43210';
      const gymEmail = settings.gym_email || 'info@rvfitness.com';

      const rawGstin = settings.gym_gstin?.trim() || '';
      const isGstConfigured =
        rawGstin.length >= 10 &&
        rawGstin.toUpperCase() !== 'N/A' &&
        rawGstin !== '27AAAAA0000A1Z5';

      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(brandDark)
        .text(gymName.toUpperCase(), leftMargin + 54, currentY + 2);

      doc
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor(brandGold)
        .text('STRENGTH & CONDITIONING CLUB', leftMargin + 54, currentY + 20);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(textSecondary)
        .text(gymAddress, leftMargin + 54, currentY + 31, { width: 230 });

      let contactLine = `Phone: ${gymPhone}  |  Email: ${gymEmail}`;
      if (isGstConfigured) {
        contactLine += `  |  GSTIN: ${rawGstin}`;
      }
      doc.text(contactLine, leftMargin + 54, currentY + 52, { width: 270 });

      // Right Header Block: Document Badge & Metadata
      const rightColX = 330;
      doc
        .font('Helvetica-Bold')
        .fontSize(15)
        .fillColor(brandDark)
        .text('PAYMENT RECEIPT', rightColX, currentY + 2, { align: 'right', width: pageWidth - (rightColX - leftMargin) });

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(brandGold)
        .text(`Receipt #: ${receipt.receiptNumber}`, rightColX, currentY + 20, { align: 'right', width: pageWidth - (rightColX - leftMargin) });

      const issueDateStr = new Date(receipt.issuedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const issueTimeStr = new Date(receipt.issuedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(textSecondary)
        .text(`Issued: ${issueDateStr}, ${issueTimeStr}`, rightColX, currentY + 33, { align: 'right', width: pageWidth - (rightColX - leftMargin) })
        .text('ORIGINAL FOR RECIPIENT', rightColX, currentY + 45, { align: 'right', width: pageWidth - (rightColX - leftMargin) });

      // Divider Line
      currentY = 125;
      doc.moveTo(leftMargin, currentY).lineTo(leftMargin + pageWidth, currentY).lineWidth(0.75).stroke(borderStroke);

      // 3. Member & Transaction Detail Two-Column Cards
      currentY += 12;
      const cardWidth = 248;
      const cardHeight = 98;

      // Card 1: Received From (Member)
      doc.roundedRect(leftMargin, currentY, cardWidth, cardHeight, 6).fillAndStroke(bgSubtle, borderStroke);
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(brandDark)
        .text('RECEIVED FROM', leftMargin + 12, currentY + 10);

      doc.rect(leftMargin + 12, currentY + 21, 24, 1.5).fill(accentYellow);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(textPrimary)
        .text(receipt.member?.user?.fullName || 'Valued Member', leftMargin + 12, currentY + 28);

      let memberDetailY = currentY + 44;
      doc.font('Helvetica').fontSize(8).fillColor(textSecondary);
      doc.text(`Member ID: ${receipt.member?.memberCode || 'N/A'}`, leftMargin + 12, memberDetailY);

      if (receipt.member?.user?.phone) {
        memberDetailY += 13;
        doc.text(`Phone: ${receipt.member.user.phone}`, leftMargin + 12, memberDetailY);
      }
      if (receipt.member?.user?.email) {
        memberDetailY += 13;
        doc.text(`Email: ${receipt.member.user.email}`, leftMargin + 12, memberDetailY, { width: cardWidth - 24, ellipsis: true });
      }

      // Card 2: Transaction Details
      const card2X = leftMargin + cardWidth + 19;
      doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 6).fillAndStroke(bgSubtle, borderStroke);
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(brandDark)
        .text('TRANSACTION DETAILS', card2X + 12, currentY + 10);

      doc.rect(card2X + 12, currentY + 21, 24, 1.5).fill(accentYellow);

      let txnDetailY = currentY + 28;
      const paymentDateFormatted = new Date(receipt.payment?.paymentDate || receipt.issuedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      doc.font('Helvetica').fontSize(8).fillColor(textSecondary);
      doc.text('Payment Voucher:', card2X + 12, txnDetailY);
      doc.font('Helvetica-Bold').fillColor(textPrimary).text(receipt.payment?.paymentNumber || 'Auto-Allocated', card2X + 90, txnDetailY);

      txnDetailY += 13;
      doc.font('Helvetica').fillColor(textSecondary).text('Payment Date:', card2X + 12, txnDetailY);
      doc.font('Helvetica-Bold').fillColor(textPrimary).text(paymentDateFormatted, card2X + 90, txnDetailY);

      txnDetailY += 13;
      doc.font('Helvetica').fillColor(textSecondary).text('Payment Method:', card2X + 12, txnDetailY);
      doc.font('Helvetica-Bold').fillColor(textPrimary).text(String(receipt.payment?.method || 'CASH').replace(/_/g, ' '), card2X + 90, txnDetailY);

      if (receipt.payment?.referenceNumber) {
        txnDetailY += 13;
        doc.font('Helvetica').fillColor(textSecondary).text('Txn / UTR Ref:', card2X + 12, txnDetailY);
        doc.font('Helvetica-Bold').fillColor(textPrimary).text(receipt.payment.referenceNumber, card2X + 90, txnDetailY, { width: 145, ellipsis: true });
      }

      txnDetailY += 13;
      doc.font('Helvetica').fillColor(textSecondary).text('Associated Invoice:', card2X + 12, txnDetailY);
      doc.font('Helvetica-Bold').fillColor(brandGold).text(receipt.invoice?.invoiceNumber || 'Direct Payment', card2X + 90, txnDetailY);

      // 4. Line Items / Service Description Table
      currentY += cardHeight + 16;

      // Table Header
      doc.rect(leftMargin, currentY, pageWidth, 20).fill(brandDark);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
      doc.text('ITEM / SERVICE DESCRIPTION', leftMargin + 10, currentY + 6);
      doc.text('QTY', leftMargin + 270, currentY + 6, { width: 40, align: 'center' });
      doc.text('UNIT PRICE', leftMargin + 320, currentY + 6, { width: 60, align: 'right' });
      doc.text('TAX', leftMargin + 390, currentY + 6, { width: 45, align: 'right' });
      doc.text('NET AMOUNT', leftMargin + 440, currentY + 6, { width: 65, align: 'right' });

      currentY += 20;

      const items = receipt.invoice?.items || [];
      if (items.length > 0) {
        items.forEach((item: any, idx: number) => {
          const rowBg = idx % 2 === 0 ? '#FFFFFF' : bgSubtle;
          doc.rect(leftMargin, currentY, pageWidth, 24).fillAndStroke(rowBg, borderStroke);

          doc.font('Helvetica-Bold').fontSize(8).fillColor(textPrimary);
          doc.text(item.description, leftMargin + 10, currentY + 7, { width: 250, ellipsis: true });

          doc.font('Helvetica').fontSize(8).fillColor(textSecondary);
          doc.text(String(item.quantity || 1), leftMargin + 270, currentY + 7, { width: 40, align: 'center' });
          doc.text(formatCurrency(item.unitPricePaisa), leftMargin + 320, currentY + 7, { width: 60, align: 'right' });

          const taxDisplay = item.taxRateBps && item.taxRateBps > 0 && isGstConfigured
            ? `${item.taxRateBps / 100}%`
            : '0%';
          doc.text(taxDisplay, leftMargin + 390, currentY + 7, { width: 45, align: 'right' });
          doc.font('Helvetica-Bold').fillColor(textPrimary).text(formatCurrency(item.totalPaisa), leftMargin + 440, currentY + 7, { width: 65, align: 'right' });

          currentY += 24;
        });
      } else {
        // Fallback row for payment against subscription
        doc.rect(leftMargin, currentY, pageWidth, 24).fillAndStroke('#FFFFFF', borderStroke);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(textPrimary);
        doc.text(
          receipt.membership?.planName
            ? `Gym Membership Subscription — ${receipt.membership.planName}`
            : 'Gym Membership Subscription & Facility Access',
          leftMargin + 10,
          currentY + 7
        );
        doc.font('Helvetica').fontSize(8).fillColor(textSecondary);
        doc.text('1', leftMargin + 270, currentY + 7, { width: 40, align: 'center' });
        doc.text(formatCurrency(receipt.amountPaisa), leftMargin + 320, currentY + 7, { width: 60, align: 'right' });
        doc.text('0%', leftMargin + 390, currentY + 7, { width: 45, align: 'right' });
        doc.font('Helvetica-Bold').fillColor(textPrimary).text(formatCurrency(receipt.amountPaisa), leftMargin + 440, currentY + 7, { width: 65, align: 'right' });
        currentY += 24;
      }

      // 5. Financial Ledger Box (Right-aligned) & Membership Note (Left)
      currentY += 12;
      const ledgerBoxWidth = 220;
      const ledgerBoxX = leftMargin + pageWidth - ledgerBoxWidth;

      // Left Box: Membership Coverage / Notes
      const noteBoxWidth = 275;
      doc.roundedRect(leftMargin, currentY, noteBoxWidth, 102, 6).fillAndStroke(bgSubtle, borderStroke);
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(brandDark)
        .text('MEMBERSHIP & ALLOCATION SUMMARY', leftMargin + 12, currentY + 10);

      doc.font('Helvetica').fontSize(7.5).fillColor(textSecondary);
      let noteY = currentY + 26;

      if (receipt.membership) {
        doc.text(`Active Plan: ${receipt.membership.planName}`, leftMargin + 12, noteY);
        noteY += 12;
        if (receipt.membership.startDate && receipt.membership.endDate) {
          const sDate = new Date(receipt.membership.startDate).toLocaleDateString('en-IN');
          const eDate = new Date(receipt.membership.endDate).toLocaleDateString('en-IN');
          doc.text(`Membership Period: ${sDate} to ${eDate}`, leftMargin + 12, noteY);
          noteY += 12;
        }
      }

      doc.text(`Recorded By: ${receipt.issuer?.fullName || 'Staff Cashier'}`, leftMargin + 12, noteY);
      noteY += 12;
      doc.text(`Payment Status: ${receipt.payment?.status || 'CONFIRMED'}`, leftMargin + 12, noteY);
      noteY += 12;
      doc.text(
        isGstConfigured
          ? 'GST Registration: Registered Dealer in Maharashtra.'
          : 'Tax Treatment: Composition / Unregistered Gym Operator (No Tax Credit).',
        leftMargin + 12,
        noteY,
        { width: noteBoxWidth - 24 }
      );

      // Right Box: Balances & Amount Paid
      doc.roundedRect(ledgerBoxX, currentY, ledgerBoxWidth, 102, 6).fillAndStroke('#FFFFFF', borderStroke);

      let ledgerY = currentY + 10;
      doc.font('Helvetica').fontSize(8).fillColor(textSecondary).text('Total Invoice Amount:', ledgerBoxX + 12, ledgerY);
      doc.font('Helvetica-Bold').fillColor(textPrimary).text(receipt.formattedInvoiceTotal, ledgerBoxX + 120, ledgerY, { width: 88, align: 'right' });

      ledgerY += 14;
      doc.font('Helvetica').fillColor(textSecondary).text('Previous Payments:', ledgerBoxX + 12, ledgerY);
      doc.font('Helvetica').fillColor(textPrimary).text(receipt.formattedPreviousPayments, ledgerBoxX + 120, ledgerY, { width: 88, align: 'right' });

      // Prominent Received Amount Banner
      ledgerY += 15;
      doc.roundedRect(ledgerBoxX + 8, ledgerY, ledgerBoxWidth - 16, 32, 4).fillAndStroke('#FEF3C7', brandGold);
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(brandGold)
        .text('CURRENT PAYMENT RECEIVED', ledgerBoxX + 14, ledgerY + 4);

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#78350F')
        .text(receipt.formattedAmount, ledgerBoxX + 14, ledgerY + 15, { width: ledgerBoxWidth - 28, align: 'right' });

      ledgerY += 38;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(textSecondary).text('Remaining Balance Due:', ledgerBoxX + 12, ledgerY);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(receipt.remainingBalancePaisa > 0 ? '#DC2626' : '#059669').text(
        receipt.formattedRemainingBalance,
        ledgerBoxX + 120,
        ledgerY,
        { width: 88, align: 'right' }
      );

      // 6. Amount in Words Banner
      currentY += 114;
      doc.roundedRect(leftMargin, currentY, pageWidth, 28, 5).fillAndStroke(bgSubtle, borderStroke);
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(brandDark)
        .text('AMOUNT IN WORDS: ', leftMargin + 10, currentY + 9, { continued: true })
        .font('Helvetica')
        .fillColor(textSecondary)
        .text(receipt.amountWords);

      // 7. Terms & Authorized Signatory Block
      currentY += 38;

      // Terms
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(brandDark).text('TERMS & CONDITIONS', leftMargin, currentY);
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(textSecondary)
        .text('1. This document serves as official acknowledgement of fees received at RV Fitness, Narsobawadi.', leftMargin, currentY + 12)
        .text('2. Membership subscriptions are strictly non-transferable and non-refundable unless authorized in writing.', leftMargin, currentY + 22)
        .text('3. In case of discrepancies, please produce this original receipt within 7 days of settlement.', leftMargin, currentY + 32);

      // Signatory
      const sigX = leftMargin + pageWidth - 140;
      doc.moveTo(sigX, currentY + 32).lineTo(sigX + 140, currentY + 32).lineWidth(0.75).stroke(textSecondary);
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(brandDark)
        .text('Authorized Signatory', sigX, currentY + 36, { width: 140, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(textSecondary)
        .text('RV Fitness, Narsobawadi', sigX, currentY + 46, { width: 140, align: 'center' });

      // 8. Bottom Page Footnote
      doc
        .font('Helvetica')
        .fontSize(6.5)
        .fillColor('#9CA3AF')
        .text(
          `Document Ref: ${receipt.id.slice(0, 8).toUpperCase()}  •  Generated on ${new Date().toISOString()}  •  RV Fitness Automated Billing  •  Page 1 of 1`,
          leftMargin,
          795,
          { width: pageWidth, align: 'center' }
        );

      doc.end();
    });
  }
}
