import { format, parseISO, isValid } from 'date-fns';
import { InvoiceStatus, PaymentMethod, PaymentStatus, RefundStatus } from '@/types';

/**
 * Convert integer paisa (minor unit) to INR Rupees decimal
 */
export const paisaToRupees = (paisa: number): number => {
  if (isNaN(paisa)) return 0;
  return paisa / 100;
};

/**
 * Convert INR Rupees to integer paisa (minor unit)
 */
export const rupeesToPaisa = (rupees: number): number => {
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
};

/**
 * Format paisa into Indian currency format (e.g. ₹2,000.00)
 */
export const formatCurrency = (paisa: number): string => {
  if (paisa === undefined || paisa === null || isNaN(paisa)) return '₹0.00';
  const rupees = paisaToRupees(paisa);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
};

/**
 * Format date string (e.g. "15 Dec 2024")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '-';
    return format(d, 'dd MMM yyyy');
  } catch {
    return '-';
  }
};

/**
 * Format date-time string (e.g. "15 Dec 2024, 02:30 PM")
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '-';
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return '-';
  }
};

/**
 * Format invoice status into human label and badge variant
 */
export const formatInvoiceStatus = (
  status: InvoiceStatus | string
): { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' } => {
  switch (status) {
    case 'PAID':
      return { label: 'Paid', variant: 'success' };
    case 'PARTIALLY_PAID':
      return { label: 'Partially Paid', variant: 'warning' };
    case 'ISSUED':
      return { label: 'Issued', variant: 'info' };
    case 'DRAFT':
      return { label: 'Draft', variant: 'default' };
    case 'OVERDUE':
      return { label: 'Overdue', variant: 'danger' };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'default' };
    case 'VOID':
      return { label: 'Void', variant: 'danger' };
    default:
      return { label: status, variant: 'default' };
  }
};

/**
 * Format payment status
 */
export const formatPaymentStatus = (
  status: PaymentStatus | string
): { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' } => {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'Confirmed', variant: 'success' };
    case 'PENDING':
      return { label: 'Pending', variant: 'warning' };
    case 'FAILED':
      return { label: 'Failed', variant: 'danger' };
    case 'REVERSED':
      return { label: 'Reversed', variant: 'default' };
    default:
      return { label: status, variant: 'default' };
  }
};

/**
 * Format refund status
 */
export const formatRefundStatus = (
  status: RefundStatus | string
): { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' } => {
  switch (status) {
    case 'PROCESSED':
      return { label: 'Processed', variant: 'success' };
    case 'APPROVED':
      return { label: 'Approved', variant: 'info' };
    case 'REQUESTED':
      return { label: 'Requested', variant: 'warning' };
    case 'REJECTED':
      return { label: 'Rejected', variant: 'danger' };
    default:
      return { label: status, variant: 'default' };
  }
};

/**
 * Format payment method into readable string
 */
export const formatPaymentMethod = (method: PaymentMethod | string): string => {
  switch (method) {
    case 'CASH':
      return 'Cash';
    case 'UPI':
      return 'UPI';
    case 'BANK_TRANSFER':
      return 'Bank Transfer';
    case 'CARD':
      return 'Credit/Debit Card';
    case 'ORIGINAL_METHOD':
      return 'Original Method';
    case 'OTHER':
      return 'Other';
    default:
      return method || '-';
  }
};
