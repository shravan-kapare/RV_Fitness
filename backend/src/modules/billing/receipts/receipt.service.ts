import { prisma } from '../../../config/database';
import { UserRole } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../../shared/errors';
import { formatCurrency, amountInWords } from '../../../shared/financial';
import { SettingsService } from '../settings/settings.service';
import PDFDocument from 'pdfkit';

export class ReceiptService {
  public static serializeReceipt(receipt: any): any {
    if (!receipt) return receipt;
    return {
      ...receipt,
      amountPaisa: Number(receipt.amountPaisa),
      formattedAmount: formatCurrency(receipt.amountPaisa),
      amountWords: amountInWords(receipt.amountPaisa),
      payment: receipt.payment
        ? {
            ...receipt.payment,
            amountPaisa: Number(receipt.payment.amountPaisa),
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
          include: { items: true },
        },
        member: {
          include: { user: { select: { fullName: true, email: true, phone: true } } },
        },
        issuer: { select: { fullName: true } },
      },
    });

    if (!receipt) throw new NotFoundError('Receipt not found');

    if (user && user.role === UserRole.MEMBER && receipt.member.userId !== user.id) {
      throw new ForbiddenError('You can only access your own payment receipts');
    }

    return this.serializeReceipt(receipt);
  }

  public static async findAll(
    filters: {
      page?: number;
      limit?: number;
      memberId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    user?: { id: string; role: UserRole }
  ) {
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

    const [total, receipts] = await Promise.all([
      prisma.receipt.count({ where }),
      prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          payment: { select: { method: true, referenceNumber: true, paymentDate: true } },
          invoice: { select: { invoiceNumber: true } },
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
   * Generates a branded, printable PDF document for the receipt using PDFKit.
   */
  public static async generatePdfBuffer(id: string, user?: { id: string; role: UserRole }): Promise<Buffer> {
    const receipt = await this.findById(id, user);
    const settings = await SettingsService.getAll();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Colors
      const primaryGold = '#D97706';
      const textDark = '#111827';
      const textMuted = '#4B5563';
      const surfaceLight = '#F3F4F6';

      // Header Banner
      doc.rect(40, 40, 515, 75).fill('#1A1A1A');

      // Title & Gym Branding
      doc
        .fillColor(primaryGold)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('RV FITNESS', 55, 52, { continued: false });

      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica')
        .text(settings.gym_address || 'Narsobawadi, Maharashtra, India', 55, 78)
        .text(`Phone: ${settings.gym_phone || '+91 98765 43210'} | GSTIN: ${settings.gym_gstin || 'N/A'}`, 55, 92);

      // Receipt Badge on the right
      doc
        .fillColor(primaryGold)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('PAYMENT RECEIPT', 380, 55, { align: 'right' });

      doc
        .fillColor('#E5E7EB')
        .fontSize(10)
        .font('Helvetica')
        .text(`Receipt #: ${receipt.receiptNumber}`, 380, 78, { align: 'right' })
        .text(`Date: ${new Date(receipt.issuedAt).toLocaleDateString('en-IN')}`, 380, 92, { align: 'right' });

      // Receipt Details Section
      doc.moveDown(4);
      const topY = 135;

      // Member Info Box
      doc.rect(40, topY, 250, 85).fillAndStroke(surfaceLight, '#E5E7EB');
      doc
        .fillColor(textDark)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('RECEIVED FROM:', 50, topY + 10);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(textMuted)
        .text(`Name: ${receipt.member.user.fullName}`, 50, topY + 28)
        .text(`Member Code: ${receipt.member.memberCode}`, 50, topY + 42)
        .text(`Phone: ${receipt.member.user.phone || 'N/A'}`, 50, topY + 56)
        .text(`Email: ${receipt.member.user.email}`, 50, topY + 70);

      // Payment Details Box
      doc.rect(305, topY, 250, 85).fillAndStroke(surfaceLight, '#E5E7EB');
      doc
        .fillColor(textDark)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('PAYMENT METRICS:', 315, topY + 10);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(textMuted)
        .text(`Invoice Ref: ${receipt.invoice.invoiceNumber}`, 315, topY + 28)
        .text(`Payment Method: ${receipt.payment.method}`, 315, topY + 42)
        .text(`Txn Ref: ${receipt.payment.referenceNumber || 'N/A'}`, 315, topY + 56)
        .text(`Issued By: ${receipt.issuer?.fullName || 'Staff'}`, 315, topY + 70);

      // Payment Amount Highlight Banner
      const amountY = 240;
      doc.rect(40, amountY, 515, 60).fill('#FEF3C7');
      doc.rect(40, amountY, 515, 60).stroke(primaryGold);

      doc
        .fillColor('#92400E')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('AMOUNT RECEIVED', 55, amountY + 12);

      doc
        .fillColor('#B45309')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(formatCurrency(receipt.amountPaisa), 55, amountY + 28);

      // Amount in Words
      doc.moveDown(5);
      const wordsY = 320;
      doc
        .fillColor(textDark)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Amount in Words: ', 45, wordsY, { continued: true })
        .font('Helvetica')
        .fillColor(textMuted)
        .text(amountInWords(receipt.amountPaisa));

      // Divider Line
      doc.moveTo(40, 350).lineTo(555, 350).stroke('#D1D5DB');

      // Notes & Terms
      doc.moveDown(2);
      const notesY = 370;
      doc
        .fillColor(textDark)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('Terms & Conditions:', 45, notesY);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(textMuted)
        .text('1. This receipt is computer generated and valid for all gym admission records.', 45, notesY + 15)
        .text('2. Membership subscriptions are subject to the agreed terms of RV Fitness, Narsobawadi.', 45, notesY + 28)
        .text('3. For any discrepancies, please present this original receipt within 7 business days.', 45, notesY + 41);

      // Signatory Section
      const signY = 460;
      doc.moveTo(380, signY).lineTo(530, signY).stroke('#9CA3AF');
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(textDark)
        .text('Authorized Signatory', 380, signY + 6, { align: 'center', width: 150 });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(textMuted)
        .text('RV Fitness, Narsobawadi', 380, signY + 18, { align: 'center', width: 150 });

      // Footer
      doc
        .fontSize(7)
        .fillColor('#9CA3AF')
        .text('Official Billing Document — Generated by RV Fitness Management System', 40, 550, {
          align: 'center',
          width: 515,
        });

      doc.end();
    });
  }
}
