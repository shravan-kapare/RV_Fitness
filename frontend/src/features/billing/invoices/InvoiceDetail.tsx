import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  FileCheck,
  XCircle,
  Clock,
  User as UserIcon,
  Calendar,
  AlertTriangle,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { useInvoice, useIssueInvoice, useCancelInvoice } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';
import { useAuthStore } from '@/stores/authStore';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: invoice, isLoading, refetch } = useInvoice(id || '');
  const { mutateAsync: issueInvoice, isPending: isIssuing } = useIssueInvoice();
  const { mutateAsync: cancelInvoice, isPending: isCancelling } = useCancelInvoice();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">Invoice record not found</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')} className="mt-4">
          Return to Invoices
        </Button>
      </div>
    );
  }

  const balancePaisa = Number(invoice.totalPaisa) - Number(invoice.paidPaisa);
  const isAdmin = user?.role === 'ADMIN';

  const handleIssue = async () => {
    if (!id) return;
    await issueInvoice(id);
    refetch();
  };

  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this invoice?')) return;
    await cancelInvoice(id);
    refetch();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Invoices</span>
        </Button>

        <div className="flex items-center gap-3">
          {isAdmin && invoice.status === 'DRAFT' && (
            <Button variant="primary" size="sm" onClick={handleIssue} isLoading={isIssuing}>
              <FileCheck className="w-4 h-4 mr-1.5" />
              <span>Issue Invoice</span>
            </Button>
          )}

          {isAdmin && (invoice.status === 'DRAFT' || invoice.status === 'ISSUED') && (
            <Button variant="danger" size="sm" onClick={handleCancel} isLoading={isCancelling}>
              <XCircle className="w-4 h-4 mr-1.5" />
              <span>Cancel Invoice</span>
            </Button>
          )}

          {isAdmin && balancePaisa > 0 && invoice.status !== 'CANCELLED' && (
            <Link to={`/payments/record?invoiceId=${invoice.id}`}>
              <Button variant="primary" size="sm">
                <CreditCard className="w-4 h-4 mr-1.5" />
                <span>Record Payment</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Invoice Card */}
      <Card className="p-8 border-[#262626] bg-[#111111] space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {invoice.invoiceNumber}
              </h2>
              <StatusBadge status={invoice.status} type="invoice" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Issued: {invoice.issuedAt ? formatDate(invoice.issuedAt) : 'Pending Issue'}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">
              RV FITNESS GYM
            </span>
            <span className="text-xs text-gray-400">Narsobawadi, Shirol, Kolhapur</span>
            <span className="text-xs text-gray-400 block">GSTIN: 27AABCR1234F1Z9</span>
          </div>
        </div>

        {/* Member & Due Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-[#161616] border border-[#222]">
          <div>
            <span className="text-[11px] font-semibold text-[#F59E0B] uppercase tracking-wider block mb-1">
              Billed To
            </span>
            <p className="text-sm font-bold text-white">{invoice.member?.user?.fullName}</p>
            <p className="text-xs text-gray-400">Member ID: {invoice.member?.memberCode}</p>
            <p className="text-xs text-gray-400">{invoice.member?.user?.email}</p>
            {invoice.member?.user?.phone && (
              <p className="text-xs text-gray-400">Phone: {invoice.member.user.phone}</p>
            )}
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Payment Terms
            </span>
            <p className="text-xs text-white">
              Due Date: <span className="font-semibold text-amber-400">{formatDate(invoice.dueDate)}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created: {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#262626] text-gray-400">
                <th className="py-3 font-semibold">Item Description</th>
                <th className="py-3 font-semibold text-center">Qty</th>
                <th className="py-3 font-semibold text-right">Unit Price</th>
                <th className="py-3 font-semibold text-right">Tax (GST)</th>
                <th className="py-3 font-semibold text-right">Discount</th>
                <th className="py-3 font-semibold text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {invoice.items?.map((item) => (
                <tr key={item.id} className="text-gray-300">
                  <td className="py-3 font-medium text-white">{item.description}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(item.unitPricePaisa)}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(item.taxPaisa)} ({item.taxRateBps / 100}%)
                  </td>
                  <td className="py-3 text-right text-amber-400">
                    -{formatCurrency(item.discountPaisa)}
                  </td>
                  <td className="py-3 text-right font-bold text-white">
                    {formatCurrency(item.totalPaisa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Totals Breakdown */}
        <div className="flex justify-end pt-4 border-t border-[#262626]">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span className="text-white">{formatCurrency(invoice.subtotalPaisa)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax (GST):</span>
              <span className="text-white">+{formatCurrency(invoice.taxPaisa)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Discount Applied:</span>
              <span className="text-amber-400">-{formatCurrency(invoice.discountPaisa)}</span>
            </div>
            <div className="pt-2 border-t border-[#333] flex justify-between font-bold text-sm text-white">
              <span>Total Payable:</span>
              <span className="text-[#F59E0B]">{formatCurrency(invoice.totalPaisa)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 pt-1">
              <span>Amount Paid:</span>
              <span>{formatCurrency(invoice.paidPaisa)}</span>
            </div>
            <div className="pt-2 border-t border-[#222] flex justify-between font-bold text-sm">
              <span className="text-gray-300">Balance Due:</span>
              <span className={balancePaisa > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {formatCurrency(balancePaisa)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History for this Invoice */}
        <div className="pt-6 border-t border-[#262626]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <ReceiptIcon className="w-4 h-4 text-[#F59E0B]" />
            <span>Associated Payments & Receipts</span>
          </h3>

          {!invoice.payments || invoice.payments.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center bg-[#161616] rounded-lg">
              No payments recorded against this invoice yet.
            </p>
          ) : (
            <div className="space-y-2">
              {invoice.payments.map((pmt) => (
                <div
                  key={pmt.id}
                  className="p-3 rounded-lg bg-[#161616] border border-[#222] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{pmt.paymentNumber}</span>
                      <StatusBadge status={pmt.status} type="payment" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatPaymentMethod(pmt.method)} • {formatDate(pmt.paymentDate)} • Ref:{' '}
                      {pmt.referenceNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{formatCurrency(pmt.amountPaisa)}</p>
                    <Link
                      to={`/payments/${pmt.id}`}
                      className="text-[10px] text-[#F59E0B] hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
