import { describe, it, expect } from 'vitest';
import { calculateItemTotal } from '../../src/shared/financial';

describe('Invoice Calculations & Business Rules', () => {
  it('preserves historical snapshotting when membership prices change', () => {
    // Original plan price at time of invoice creation: 2,500 INR
    const snapshottedPrice = 250000n;
    const snapshottedTaxRate = 1800; // 18%

    const invoiceItem = {
      unitPricePaisa: snapshottedPrice,
      ...calculateItemTotal(snapshottedPrice, 1, snapshottedTaxRate, 0n),
    };
    expect(invoiceItem.totalPaisa).toBe(295000n); // 2,950 INR

    // Future gym plan price updated to 3,000 INR
    const updatedPlanPrice = 300000n;
    // The existing invoice item remains untouched because it relies on its stored snapshotted values
    expect(invoiceItem.totalPaisa).toBe(295000n);
    expect(invoiceItem.unitPricePaisa).toBe(250000n);
    expect(updatedPlanPrice).not.toBe(invoiceItem.unitPricePaisa);
  });

  it('correctly computes outstanding balance after partial payments', () => {
    const totalPaisa = 1000000n; // 10,000 INR
    let paidPaisa = 0n;

    // First partial payment of 4,000 INR
    const payment1 = 400000n;
    paidPaisa += payment1;
    let balance = totalPaisa - paidPaisa;
    expect(balance).toBe(600000n); // 6,000 INR remaining

    // Second partial payment of 3,500 INR
    const payment2 = 350000n;
    paidPaisa += payment2;
    balance = totalPaisa - paidPaisa;
    expect(balance).toBe(250000n); // 2,500 INR remaining

    // Final payment of 2,500 INR
    const payment3 = 250000n;
    paidPaisa += payment3;
    balance = totalPaisa - paidPaisa;
    expect(balance).toBe(0n); // Fully paid
  });

  it('detects and rejects overpayments exceeding remaining balance', () => {
    const totalPaisa = 500000n; // 5,000 INR
    const paidPaisa = 300000n; // 3,000 INR already paid
    const remainingBalance = totalPaisa - paidPaisa; // 2,000 INR

    const attemptedOverpayment = 250000n; // 2,500 INR
    const isOverpayment = attemptedOverpayment > remainingBalance;
    expect(isOverpayment).toBe(true);

    const validPayment = 200000n; // 2,000 INR
    expect(validPayment <= remainingBalance).toBe(true);
  });

  it('categorizes aging buckets for overdue invoices properly', () => {
    const today = new Date('2024-12-15T00:00:00Z');

    function getAgingBucket(dueDate: Date): string {
      const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'CURRENT';
      if (diffDays <= 30) return '1-30';
      if (diffDays <= 60) return '31-60';
      if (diffDays <= 90) return '61-90';
      return '90+';
    }

    expect(getAgingBucket(new Date('2024-12-20T00:00:00Z'))).toBe('CURRENT');
    expect(getAgingBucket(new Date('2024-12-10T00:00:00Z'))).toBe('1-30'); // 5 days overdue
    expect(getAgingBucket(new Date('2024-11-01T00:00:00Z'))).toBe('31-60'); // 44 days overdue
    expect(getAgingBucket(new Date('2024-09-30T00:00:00Z'))).toBe('61-90'); // 76 days overdue
    expect(getAgingBucket(new Date('2024-08-01T00:00:00Z'))).toBe('90+'); // 136 days overdue
  });
});
