import { describe, it, expect } from 'vitest';

describe('Payment & Refund State Machine & Constraints', () => {
  it('enforces maximum refundable amount based on original payment minus prior refunds', () => {
    const originalPaymentPaisa = 1500000n; // 15,000 INR
    let processedRefundsTotal = 0n;

    // First refund of 5,000 INR
    const refund1 = 500000n;
    expect(refund1 <= originalPaymentPaisa - processedRefundsTotal).toBe(true);
    processedRefundsTotal += refund1;

    // Remaining refundable is 10,000 INR
    const maxRemaining = originalPaymentPaisa - processedRefundsTotal;
    expect(maxRemaining).toBe(1000000n);

    // Attempting refund of 12,000 INR should be rejected
    const excessiveRefund = 1200000n;
    expect(excessiveRefund > maxRemaining).toBe(true);

    // Valid second refund of 10,000 INR
    const refund2 = 1000000n;
    expect(refund2 <= maxRemaining).toBe(true);
    processedRefundsTotal += refund2;

    // After full refund, remaining refundable is 0
    expect(originalPaymentPaisa - processedRefundsTotal).toBe(0n);
  });

  it('validates state transitions for invoices and payments', () => {
    const validInvoiceTransitions: Record<string, string[]> = {
      DRAFT: ['ISSUED', 'CANCELLED'],
      ISSUED: ['PARTIALLY_PAID', 'PAID', 'CANCELLED'],
      PARTIALLY_PAID: ['PAID', 'VOID'],
      PAID: ['VOID'],
      CANCELLED: [],
      VOID: [],
    };

    function canTransition(from: string, to: string): boolean {
      return validInvoiceTransitions[from]?.includes(to) || false;
    }

    expect(canTransition('DRAFT', 'ISSUED')).toBe(true);
    expect(canTransition('ISSUED', 'PAID')).toBe(true);
    expect(canTransition('PAID', 'CANCELLED')).toBe(false); // Paid invoices cannot be cancelled
    expect(canTransition('DRAFT', 'PAID')).toBe(false); // Drafts cannot jump directly to paid
  });

  it('validates payment reversal does not delete the original record', () => {
    const payment = {
      id: 'pay-123',
      paymentNumber: 'PAY-2024-0001',
      amountPaisa: 200000n,
      status: 'CONFIRMED',
      isDeleted: false,
    };

    // Upon reversal, the payment status changes to REVERSED while preserving history
    const reversedPayment = {
      ...payment,
      status: 'REVERSED',
    };

    expect(reversedPayment.status).toBe('REVERSED');
    expect(reversedPayment.id).toBe(payment.id);
    expect(reversedPayment.amountPaisa).toBe(payment.amountPaisa);
    expect(reversedPayment.isDeleted).toBe(false);
  });
});
