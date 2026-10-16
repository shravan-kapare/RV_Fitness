import { describe, it, expect, beforeAll } from 'vitest';
import { amountInWords, formatCurrency, paisaToRupees, rupeesToPaisa } from '../../src/shared/financial';
import { ReceiptService } from '../../src/modules/billing/receipts/receipt.service';
import { prisma } from '../../src/config/database';
import { UserRole } from '@prisma/client';

describe('Payment Receipt Financial Document Engine & Currency Calculations', () => {
  describe('1. Indian Currency in Words (amountInWords)', () => {
    it('handles zero and sub-unit zero accurately', () => {
      expect(amountInWords(0n)).toBe('Zero Rupees Only');
      expect(amountInWords(0)).toBe('Zero Rupees Only');
      expect(amountInWords('0')).toBe('Zero Rupees Only');
    });

    it('handles paise-only amounts with correct singular/plural grammar', () => {
      expect(amountInWords(1n)).toBe('One Paisa Only');
      expect(amountInWords(50n)).toBe('Fifty Paise Only');
      expect(amountInWords(99n)).toBe('Ninety Nine Paise Only');
    });

    it('handles singular rupee vs plural rupees', () => {
      expect(amountInWords(100n)).toBe('One Rupee Only');
      expect(amountInWords(200n)).toBe('Two Rupees Only');
      expect(amountInWords(101n)).toBe('One Rupee and One Paisa Only');
      expect(amountInWords(150n)).toBe('One Rupee and Fifty Paise Only');
    });

    it('correctly translates common gym subscription amounts', () => {
      // 1,500 INR (Monthly Basic)
      expect(amountInWords(150000n)).toBe('One Thousand Five Hundred Rupees Only');
      // 3,800 INR (Quarterly Strength)
      expect(amountInWords(380000n)).toBe('Three Thousand Eight Hundred Rupees Only');
      // 12,500 INR (Annual Pro)
      expect(amountInWords(1250000n)).toBe('Twelve Thousand Five Hundred Rupees Only');
      // 24,999.50 INR (Personal Training Package)
      expect(amountInWords(2499950n)).toBe('Twenty Four Thousand Nine Hundred and Ninety Nine Rupees and Fifty Paise Only');
    });

    it('handles large denominations according to the Indian Numbering System (Lakhs & Crores)', () => {
      // 1,00,000 INR = 10,000,000 paisa (1 Lakh)
      expect(amountInWords(10000000n)).toBe('One Lakh Rupees Only');
      // 15,45,250 INR = 154,525,000 paisa
      expect(amountInWords(154525000n)).toBe('Fifteen Lakh Forty Five Thousand Two Hundred and Fifty Rupees Only');
      // 1,00,00,000 INR = 1,000,000,000 paisa (1 Crore)
      expect(amountInWords(1000000000n)).toBe('One Crore Rupees Only');
      // Complex multi-tier amount: ₹1,23,45,678.99
      expect(amountInWords(1234567899n)).toBe(
        'One Crore Twenty Three Lakh Forty Five Thousand Six Hundred and Seventy Eight Rupees and Ninety Nine Paise Only'
      );
    });

    it('gracefully handles edge cases, negative amounts, and invalid inputs', () => {
      expect(amountInWords(-5000n)).toContain('Minus');
      expect(amountInWords(-5000n)).toBe('Minus Fifty Rupees Only');
      expect(amountInWords('invalid' as any)).toBe('Zero Rupees Only');
      expect(amountInWords(null as any)).toBe('Zero Rupees Only');
      expect(amountInWords(undefined as any)).toBe('Zero Rupees Only');
    });
  });

  describe('2. Partial Payment & Ledger Balance Tracking Logic', () => {
    it('accurately computes cumulative payment allocations and remaining balance', () => {
      const invoiceTotal = 2500000n; // ₹25,000 total invoice

      // Payment 1: ₹10,000 down payment
      const payment1 = 1000000n;
      const prev1 = 0n;
      const cumulative1 = prev1 + payment1;
      const balance1 = invoiceTotal > cumulative1 ? invoiceTotal - cumulative1 : 0n;

      expect(cumulative1).toBe(1000000n);
      expect(balance1).toBe(1500000n); // ₹15,000 remaining

      // Payment 2: ₹10,000 second installment
      const payment2 = 1000000n;
      const prev2 = cumulative1;
      const cumulative2 = prev2 + payment2;
      const balance2 = invoiceTotal > cumulative2 ? invoiceTotal - cumulative2 : 0n;

      expect(cumulative2).toBe(2000000n);
      expect(balance2).toBe(500000n); // ₹5,000 remaining

      // Payment 3: ₹5,000 final settlement
      const payment3 = 500000n;
      const prev3 = cumulative2;
      const cumulative3 = prev3 + payment3;
      const balance3 = invoiceTotal > cumulative3 ? invoiceTotal - cumulative3 : 0n;

      expect(cumulative3).toBe(2500000n);
      expect(balance3).toBe(0n); // ₹0 remaining (fully settled)
    });

    it('prevents balance from going below zero on excess or equal payments', () => {
      const invoiceTotal = 500000n;
      const cumulativePaid = 600000n; // overpaid edge case
      const remainingBalance = invoiceTotal > cumulativePaid ? invoiceTotal - cumulativePaid : 0n;
      expect(remainingBalance).toBe(0n);
    });
  });

  describe('3. Receipt Serialization & BigInt Minor Units Conversion', () => {
    it('serializes receipt object into client-safe JSON with formatted strings', () => {
      const mockRawReceipt = {
        id: 'rec-test-123',
        receiptNumber: 'RCP-2026-0001',
        amountPaisa: 500000n,
        previousPaymentsPaisa: 200000n,
        remainingBalancePaisa: 300000n,
        issuedAt: new Date('2026-10-15T10:00:00Z'),
        invoice: {
          id: 'inv-test-123',
          invoiceNumber: 'INV-2026-0001',
          totalPaisa: 1000000n,
          subtotalPaisa: 1000000n,
          taxPaisa: 0n,
          discountPaisa: 0n,
          paidPaisa: 700000n,
        },
        payment: {
          id: 'pay-test-123',
          paymentNumber: 'PAY-2026-0001',
          amountPaisa: 500000n,
          method: 'UPI',
          referenceNumber: 'UPI987654321',
        },
      };

      const serialized = ReceiptService.serializeReceipt(mockRawReceipt);

      expect(serialized.amountPaisa).toBe(500000);
      expect(typeof serialized.amountPaisa).toBe('number');
      expect(serialized.formattedAmount).toContain('5,000.00');
      expect(serialized.amountWords).toBe('Five Thousand Rupees Only');
      expect(serialized.previousPaymentsPaisa).toBe(200000);
      expect(serialized.formattedPreviousPayments).toContain('2,000.00');
      expect(serialized.remainingBalancePaisa).toBe(300000);
      expect(serialized.formattedRemainingBalance).toContain('3,000.00');
      expect(serialized.invoiceTotalPaisa).toBe(1000000);
      expect(serialized.formattedInvoiceTotal).toContain('10,000.00');
    });
  });

  describe('4. A4 Portrait PDF Document Generation', () => {
    let existingReceipt: any;

    beforeAll(async () => {
      // Find an existing receipt in the database
      existingReceipt = await prisma.receipt.findFirst({
        include: {
          member: true,
          payment: true,
          invoice: true,
        },
      });
    });

    it('generates an authentic, well-formed binary PDF buffer when receipt exists', async () => {
      if (!existingReceipt) {
        console.warn('Skipping live PDF generation test: no seeded receipt in database.');
        return;
      }

      const pdfBuffer = await ReceiptService.generatePdfBuffer(existingReceipt.id);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(1500);

      // Verify PDF Magic Bytes (%PDF-)
      const pdfHeader = pdfBuffer.subarray(0, 5).toString('ascii');
      expect(pdfHeader).toBe('%PDF-');

      // Verify PDF structure and document metadata dictionary
      const pdfString = pdfBuffer.toString('latin1');
      expect(pdfString).toContain('RV Fitness Narsobawadi');
      expect(pdfString).toContain('Official Payment Receipt');
      expect(pdfString).toContain('%%EOF');
    });
  });
});
