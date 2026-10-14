import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt as ReceiptIcon,
  RotateCcw,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  User as UserIcon,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { usePayment, useReversePayment } from '@/hooks/usePayments';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';
import { useAuthStore } from '@/stores/authStore';

export const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: payment, isLoading, refetch } = usePayment(id || '');
  const { mutateAsync: reversePayment, isPending: isReversing } = useReversePayment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12 bg-[#111111] border border-[#292929] rounded-xl max-w-md mx-auto my-8 p-6">
        <AlertCircle className="w-10 h-10 text-[#FFC21A] mx-auto mb-2" />
        <p className="text-[#A5A5A5] text-sm">Payment record not found</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/payments')} className="mt-4">
          Return to Payments
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  const handleReverse = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to reverse this payment? This will restore the outstanding balance on the invoice.')) return;

    await reversePayment(id);
    refetch();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Payments</span>
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          {payment.receipt && (
            <Link to={`/receipts?id=${payment.receipt.id}`}>
              <Button variant="secondary" size="sm">
                <ReceiptIcon className="w-4 h-4 mr-1.5 text-[#FFC21A]" />
                <span>View Receipt ({payment.receipt.receiptNumber})</span>
              </Button>
            </Link>
          )}

          {isAdmin && payment.status === 'CONFIRMED' && (
            <Button variant="danger" size="sm" onClick={handleReverse} isLoading={isReversing}>
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>Reverse Payment</span>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#292929] rounded-xl overflow-hidden shadow-xl">
        <div className="h-1 bg-[#FFC21A]" />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#292929]">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#F5F5F5] font-mono tracking-tight">
                  {payment.paymentNumber}
                </h1>
                <StatusBadge status={payment.status} type="payment" />
              </div>
              <p className="text-xs text-[#A5A5A5] mt-1">
                Settled on {formatDate(payment.paymentDate)} at RV Fitness Narsobawadi
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-[#A5A5A5] font-bold uppercase tracking-wider block">
                Settlement Amount
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-emerald-400">
                {formatCurrency(payment.amountPaisa)}
              </span>
            </div>
          </div>

          {/* Payment Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#171717] border border-[#292929] space-y-2.5">
              <span className="font-bold text-[10px] text-[#FFC21A] uppercase tracking-wider block">
                Transaction Details
              </span>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Payment Channel:</span>
                <span className="font-semibold text-[#F5F5F5]">{formatPaymentMethod(payment.method)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">UTR / Reference:</span>
                <span className="font-mono text-[#F5F5F5]">
                  {payment.referenceNumber || 'N/A (Desk Cash)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Confirmed At:</span>
                <span className="text-[#F5F5F5]">
                  {payment.confirmedAt ? formatDate(payment.confirmedAt) : 'Pending Confirmation'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#171717] border border-[#292929] space-y-2.5">
              <span className="font-bold text-[10px] text-[#A5A5A5] uppercase tracking-wider block">
                Member & Invoice Info
              </span>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Payer Name:</span>
                <span className="font-semibold text-[#F5F5F5]">{payment.member?.user?.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Member Code:</span>
                <span className="font-mono text-[#F5F5F5]">{payment.member?.memberCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A5A5A5]">Linked Invoice:</span>
                <Link
                  to={`/invoices/${payment.invoiceId}`}
                  className="text-[#FFC21A] hover:underline font-mono inline-flex items-center gap-1 font-semibold"
                >
                  <span>{payment.invoice?.invoiceNumber}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#A5A5A5]" />
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Invoice Total:</span>
                <span className="font-mono text-[#F5F5F5]">
                  {formatCurrency(payment.invoice?.totalPaisa || 0)}
                </span>
              </div>
            </div>
          </div>

          {payment.notes && (
            <div className="p-4 rounded-lg bg-[#171717] border border-[#292929] text-xs">
              <span className="text-[10px] font-bold text-[#A5A5A5] uppercase tracking-wider block mb-1">
                Desk Notes / Staff Memo
              </span>
              <p className="text-[#D4D4D4] leading-relaxed">{payment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
