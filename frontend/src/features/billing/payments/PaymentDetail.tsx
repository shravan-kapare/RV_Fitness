import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt as ReceiptIcon,
  RotateCcw,
  User as UserIcon,
  FileText,
  Calendar,
  ShieldAlert
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
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">Payment record not found</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/payments')} className="mt-4">
          Return to Payments
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  const handleReverse = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to reverse this payment?')) return;

    await reversePayment(id);
    refetch();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Payments</span>
        </Button>

        <div className="flex items-center gap-3">
          {payment.receipt && (
            <Link to={`/receipts?id=${payment.receipt.id}`}>
              <Button variant="secondary" size="sm">
                <ReceiptIcon className="w-4 h-4 mr-1.5" />
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

      <Card className="p-8 border-[#262626] bg-[#111111] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white">{payment.paymentNumber}</h2>
              <StatusBadge status={payment.status} type="payment" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Logged on {formatDate(payment.paymentDate)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Settlement Total</span>
            <span className="text-2xl font-black text-emerald-400">
              {formatCurrency(payment.amountPaisa)}
            </span>
          </div>
        </div>

        {/* Payment Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#161616] border border-[#222] space-y-2">
            <span className="font-semibold text-gray-400 uppercase tracking-wider block">
              Transaction Details
            </span>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Channel:</span>
              <span className="font-medium text-white">{formatPaymentMethod(payment.method)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reference / UTR:</span>
              <span className="font-medium text-[#F59E0B]">
                {payment.referenceNumber || 'N/A (Cash)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confirmed At:</span>
              <span className="text-white">
                {payment.confirmedAt ? formatDate(payment.confirmedAt) : 'Pending Confirmation'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#161616] border border-[#222] space-y-2">
            <span className="font-semibold text-gray-400 uppercase tracking-wider block">
              Member & Linked Invoice
            </span>
            <div className="flex justify-between">
              <span className="text-gray-400">Payer Name:</span>
              <span className="font-medium text-white">{payment.member?.user?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Invoice Reference:</span>
              <Link
                to={`/invoices/${payment.invoiceId}`}
                className="text-[#F59E0B] hover:underline font-medium"
              >
                {payment.invoice?.invoiceNumber}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Invoice Total:</span>
              <span className="text-white">
                {formatCurrency(payment.invoice?.totalPaisa || 0)}
              </span>
            </div>
          </div>
        </div>

        {payment.notes && (
          <div className="p-4 rounded-xl bg-[#161616] border border-[#222]">
            <span className="text-xs font-semibold text-gray-400 block mb-1">Administrative Note</span>
            <p className="text-xs text-gray-300">{payment.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
