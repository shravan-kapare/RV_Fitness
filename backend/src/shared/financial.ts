/**
 * Financial Arithmetic and Formatting Utilities
 * All monetary values are handled as integers in minor units (paisa) to avoid floating point inaccuracies.
 * 1 INR = 100 paisa.
 * Basis points: 100 bps = 1%, 1800 bps = 18%.
 */

export function rupeesToPaisa(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

export function paisaToRupees(paisa: bigint | number): number {
  return Number(paisa) / 100;
}

export function formatCurrency(paisa: bigint | number): string {
  const amount = paisaToRupees(paisa);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates tax on an amount using basis points (bps).
 * tax_paisa = (amount_paisa * tax_rate_bps) / 10000
 */
export function calculateTax(amountPaisa: bigint, taxRateBps: number): bigint {
  if (taxRateBps <= 0) return 0n;
  return (amountPaisa * BigInt(taxRateBps) + 5000n) / 10000n; // Rounded to nearest paisa
}

/**
 * Calculates line item totals snapshotted at invoice creation.
 */
export function calculateItemTotal(
  unitPricePaisa: bigint,
  quantity: number,
  taxRateBps: number = 0,
  discountPaisa: bigint = 0n
): {
  subtotalPaisa: bigint;
  taxPaisa: bigint;
  discountPaisa: bigint;
  totalPaisa: bigint;
} {
  const qty = BigInt(Math.max(1, quantity));
  const subtotalPaisa = unitPricePaisa * qty;
  const applicableSubtotal = subtotalPaisa > discountPaisa ? subtotalPaisa - discountPaisa : 0n;
  const taxPaisa = calculateTax(applicableSubtotal, taxRateBps);
  const totalPaisa = applicableSubtotal + taxPaisa;

  return {
    subtotalPaisa,
    taxPaisa,
    discountPaisa,
    totalPaisa,
  };
}

/**
 * Converts Indian Rupee amounts in paisa to words (for printable receipts and invoices).
 */
export function amountInWords(paisa: bigint | number | string): string {
  try {
    let totalPaisa: bigint;
    if (typeof paisa === 'bigint') {
      totalPaisa = paisa;
    } else if (typeof paisa === 'number') {
      if (isNaN(paisa) || !isFinite(paisa)) return 'Zero Rupees Only';
      totalPaisa = BigInt(Math.round(paisa));
    } else {
      totalPaisa = BigInt(String(paisa || '0'));
    }

    if (totalPaisa < 0n) {
      return 'Minus ' + amountInWords(-totalPaisa);
    }

    const rupees = totalPaisa / 100n;
    const remainingPaisa = totalPaisa % 100n;

    if (rupees === 0n && remainingPaisa === 0n) return 'Zero Rupees Only';

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = [
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertUnderThousand(num: number): string {
      if (num === 0) return '';
      let str = '';
      if (num >= 100) {
        str += units[Math.floor(num / 100)] + ' Hundred';
        num %= 100;
        if (num > 0) str += ' and ';
      }
      if (num >= 20) {
        str += tens[Math.floor(num / 10)];
        if (num % 10 > 0) str += ' ' + units[num % 10];
      } else if (num >= 10) {
        str += teens[num - 10];
      } else if (num > 0) {
        str += units[num];
      }
      return str.trim();
    }

    let words = '';
    let n = Number(rupees);

    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const remainder = n;

    if (crore > 0) words += convertUnderThousand(crore) + ' Crore ';
    if (lakh > 0) words += convertUnderThousand(lakh) + ' Lakh ';
    if (thousand > 0) words += convertUnderThousand(thousand) + ' Thousand ';
    if (remainder > 0) words += convertUnderThousand(remainder) + ' ';

    words = words.trim();
    if (words.length > 0) {
      words += words === 'One' ? ' Rupee' : ' Rupees';
    }

    if (remainingPaisa > 0n) {
      const pNum = Number(remainingPaisa);
      const paisaWords = convertUnderThousand(pNum);
      const unit = pNum === 1 ? 'Paisa' : 'Paise';
      if (words.length > 0) {
        words += ' and ' + paisaWords + ' ' + unit;
      } else {
        words = paisaWords + ' ' + unit;
      }
    }

    return words + ' Only';
  } catch {
    return 'Zero Rupees Only';
  }
}
