import { describe, it, expect } from 'vitest';
import {
  rupeesToPaisa,
  paisaToRupees,
  formatCurrency,
  calculateTax,
  calculateItemTotal,
  amountInWords,
} from '../../src/shared/financial';

describe('Financial Arithmetic & Minor Units (Paisa)', () => {
  it('converts rupees to paisa accurately without floating point loss', () => {
    expect(rupeesToPaisa(100)).toBe(10000n);
    expect(rupeesToPaisa(2499.99)).toBe(249999n);
    expect(rupeesToPaisa(0)).toBe(0n);
    expect(rupeesToPaisa(0.5)).toBe(50n);
  });

  it('converts paisa back to rupees accurately', () => {
    expect(paisaToRupees(10000n)).toBe(100);
    expect(paisaToRupees(249999n)).toBe(2499.99);
    expect(paisaToRupees(0n)).toBe(0);
  });

  it('formats currency with Indian numbering system and Rupee symbol', () => {
    const formatted = formatCurrency(200000n); // ₹2,000.00
    expect(formatted).toContain('2,000.00');

    const formattedLarge = formatCurrency(150000000n); // ₹15,00,000.00
    expect(formattedLarge).toContain('15,00,000.00');
  });

  it('calculates GST tax using basis points (1800 bps = 18%)', () => {
    // 10,000 INR (1,000,000 paisa) at 18% = 1,800 INR (180,000 paisa)
    const tax = calculateTax(1000000n, 1800);
    expect(tax).toBe(180000n);

    // 0 bps = 0 tax
    expect(calculateTax(1000000n, 0)).toBe(0n);

    // Rounding check
    const taxOdd = calculateTax(10005n, 1800); // 1800.9 rounded = 1801n
    expect(taxOdd).toBe(1801n);
  });

  it('calculates line item totals with quantity, tax, and discounts', () => {
    // Unit price: 2,000 INR (200,000 paisa), Qty: 2, Tax: 18%, Discount: 500 INR (50,000 paisa)
    const result = calculateItemTotal(200000n, 2, 1800, 50000n);

    expect(result.subtotalPaisa).toBe(400000n); // 4,000 INR
    expect(result.discountPaisa).toBe(50000n); // 500 INR
    // Taxable subtotal = 400,000 - 50,000 = 350,000 paisa. 18% of 350,000 = 63,000 paisa
    expect(result.taxPaisa).toBe(63000n);
    // Total = 350,000 + 63,000 = 413,000 paisa (4,130 INR)
    expect(result.totalPaisa).toBe(413000n);
  });

  it('converts amounts to English words (INR) for receipts', () => {
    expect(amountInWords(200000n)).toBe('Two Thousand Rupees Only');
    expect(amountInWords(1534000n)).toBe('Fifteen Thousand Three Hundred and Forty Rupees Only');
    expect(amountInWords(5050n)).toBe('Fifty Rupees and Fifty Paise Only');
    expect(amountInWords(5001n)).toBe('Fifty Rupees and One Paisa Only');
    expect(amountInWords(75n)).toBe('Seventy Five Paise Only');
    expect(amountInWords(1n)).toBe('One Paisa Only');
  });
});
