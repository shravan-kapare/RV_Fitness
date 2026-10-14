import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  FileCheck,
  XCircle,
  Printer,
  Calendar,
  Building,
  User as UserIcon,
  Receipt as ReceiptIcon,
  ExternalLink,
  ShieldCheck,
  AlertCircle
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
      <div className="flex items-center justify-center h-72">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16 bg-[#111111] border border-[#292929] rounded-xl max-w-xl mx-auto my-8 p-8">
        <AlertCircle className="w-12 h-12 text-[#FFC21A] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#F5F5F5]">Invoice Not Found</h3>
        <p className="text-sm text-[#A5A5A5] mt-1">The requested invoice record does not exist or you do not have permission to view it.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/invoices')} className="mt-5">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Return to Invoices</span>
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
    if (!id || !confirm('Are you sure you want to cancel this invoice? This will prevent further payments.')) return;
    await cancelInvoice(id);
    refetch();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Invoices</span>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5 text-[#A5A5A5]" />
            <span>Print Invoice</span>
          </Button>

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

      {/* Main Authoritative Document Container */}
      <div className="bg-[#111111] border border-[#292929] rounded-xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white">
        {/* Document Header Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#FFC21A] via-[#E6AC12] to-[#FFC21A]/20 print:hidden" />

        <div className="p-6 sm:p-10 space-y-8 print:p-0">
          {/* Top Header: Gym Branding & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-[#292929] print:border-gray-200">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFC21A] flex items-center justify-center font-black text-[#080808] text-xl shadow-md">
                  RV
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-wider text-[#F5F5F5] uppercase print:text-black">
                    RV FITNESS
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFC21A] block">
                    Narsobawadi Center
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-[#A5A5A5] space-y-0.5 print:text-gray-600">
                <p>Near Datta Temple Road, Narsobawadi</p>
                <p>Taluka Shirol, Dist. Kolhapur, Maharashtra 416104</p>
                <p className="text-[11px] font-mono pt-1 text-[#F5F5F5] print:text-black">
                  GSTIN: <span className="font-semibold">27AABCR1234F1Z9</span>
                </p>
              </div>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={invoice.status} type="invoice" />
                <span className="text-xs font-semibold text-[#A5A5A5] uppercase tracking-wider">
                  Tax Invoice
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#F5F5F5] font-mono tracking-tight print:text-black">
                {invoice.invoiceNumber}
              </h2>
              <div className="mt-2 text-xs text-[#A5A5A5] space-y-1 print:text-gray-600">
                <p>
                  Date Issued:{' '}
                  <span className="font-medium text-[#F5F5F5] print:text-black">
                    {invoice.issuedAt ? formatDate(invoice.issuedAt) : 'Draft (Unissued)'}
                  </span>
                </p>
                <p>
                  Payment Due:{' '}
                  <span className="font-semibold text-[#FFC21A] print:text-black">
                    {formatDate(invoice.dueDate)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Billing Entity & Member Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-lg bg-[#171717] border border-[#292929] print:bg-gray-50 print:border-gray-200">
            <div>
              <span className="text-[10px] font-bold text-[#FFC21A] uppercase tracking-wider block mb-1">
                Billed To (Member Details)
              </span>
              <p className="text-base font-bold text-[#F5F5F5] print:text-black">
                {invoice.member?.user?.fullName || 'N/A'}
              </p>
              <div className="mt-2 text-xs text-[#A5A5A5] space-y-0.5 print:text-gray-600">
                <p>
                  Member Code: <span className="font-mono text-[#F5F5F5] print:text-black">{invoice.member?.memberCode}</span>
                </p>
                <p>Email: {invoice.member?.user?.email}</p>
                {invoice.member?.user?.phone && <p>Phone: +91 {invoice.member.user.phone}</p>}
                {invoice.member?.address && <p>Address: {invoice.member.address}</p>}
              </div>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#A5A5A5] uppercase tracking-wider block mb-1">
                  Payment Status & Terms
                </span>
                <p className="text-xs text-[#A5A5A5] print:text-gray-600">
                  Terms: <span className="text-[#F5F5F5] font-medium print:text-black">Due on receipt / monthly renewal</span>
                </p>
                <p className="text-xs text-[#A5A5A5] mt-1 print:text-gray-600">
                  Created:{' '}
                  <span className="text-[#F5F5F5] font-medium print:text-black">
                    {formatDate(invoice.createdAt)}
                  </span>
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#292929] sm:border-0 print:border-none">
                <span className="text-[10px] uppercase font-mono text-[#A5A5A5]">Outstanding Amount</span>
                <p className={`text-xl font-bold font-mono ${balancePaisa > 0 ? 'text-rose-400' : 'text-emerald-400'} print:text-black`}>
                  {formatCurrency(balancePaisa)}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[#A5A5A5] uppercase tracking-wider text-[11px] print:border-gray-300">
                  <th className="py-3 px-2 font-semibold">#</th>
                  <th className="py-3 px-2 font-semibold">Service / Description</th>
                  <th className="py-3 px-2 font-semibold text-center">Qty</th>
                  <th className="py-3 px-2 font-semibold text-right">Unit Rate</th>
                  <th className="py-3 px-2 font-semibold text-right">GST Rate</th>
                  <th className="py-3 px-2 font-semibold text-right">Discount</th>
                  <th className="py-3 px-2 font-semibold text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F] print:divide-gray-200">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={item.id} className="text-[#D4D4D4] hover:bg-[#171717]/50 print:text-black">
                      <td className="py-3 px-2 font-mono text-[#737373] text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-2 font-medium text-[#F5F5F5] print:text-black">
                        {item.description}
                      </td>
                      <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {formatCurrency(item.unitPricePaisa)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-[#A5A5A5] print:text-gray-600">
                        {formatCurrency(item.taxPaisa)}{' '}
                        <span className="text-[10px]">({(item.taxRateBps / 100).toFixed(0)}%)</span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-amber-400 print:text-gray-700">
                        {Number(item.discountPaisa) > 0 ? `-${formatCurrency(item.discountPaisa)}` : '₹0.00'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold tabular-nums text-[#F5F5F5] print:text-black">
                        {formatCurrency(item.totalPaisa)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#A5A5A5]">
                      No invoice line items available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-[#292929] print:border-gray-200">
            <div className="max-w-xs space-y-2 text-xs text-[#A5A5A5] print:text-gray-600">
              <div className="flex items-center gap-1.5 text-[#FFC21A] font-semibold text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Authorized Financial Voucher</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All memberships and personal training services at RV Fitness are subject to the terms and gym rules agreed upon enrollment. Receipts are issued upon payment verification.
              </p>
              {invoice.notes && (
                <div className="p-2.5 bg-[#171717] rounded border border-[#292929] text-[11px] text-[#D4D4D4] mt-2">
                  <span className="font-semibold block text-[#A5A5A5]">Invoice Notes:</span>
                  {invoice.notes}
                </div>
              )}
            </div>

            <div className="w-full sm:w-80 bg-[#171717] border border-[#292929] rounded-lg p-4 space-y-2.5 text-xs print:bg-white print:border-gray-300">
              <div className="flex justify-between text-[#A5A5A5] print:text-gray-600">
                <span>Subtotal (Base):</span>
                <span className="font-mono tabular-nums text-[#F5F5F5] print:text-black">
                  {formatCurrency(invoice.subtotalPaisa)}
                </span>
              </div>
              <div className="flex justify-between text-[#A5A5A5] print:text-gray-600">
                <span>GST Tax (Included/Applicable):</span>
                <span className="font-mono tabular-nums text-[#F5F5F5] print:text-black">
                  +{formatCurrency(invoice.taxPaisa)}
                </span>
              </div>
              {Number(invoice.discountPaisa) > 0 && (
                <div className="flex justify-between text-amber-400 print:text-gray-700">
                  <span>Special Discount:</span>
                  <span className="font-mono tabular-nums">
                    -{formatCurrency(invoice.discountPaisa)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#292929] flex justify-between font-bold text-sm text-[#F5F5F5] print:text-black">
                <span>Total Amount:</span>
                <span className="font-mono tabular-nums text-[#FFC21A] print:text-black">
                  {formatCurrency(invoice.totalPaisa)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 pt-1 print:text-emerald-700">
                <span>Total Paid to Date:</span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatCurrency(invoice.paidPaisa)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#292929] flex justify-between font-bold text-sm">
                <span className="text-[#A5A5A5] print:text-gray-700">Net Due Balance:</span>
                <span className={`font-mono tabular-nums ${balancePaisa > 0 ? 'text-rose-400' : 'text-emerald-400'} print:text-black`}>
                  {formatCurrency(balancePaisa)}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Payment Transactions & Receipts */}
          <div className="pt-6 border-t border-[#292929] no-print">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
                <ReceiptIcon className="w-4 h-4 text-[#FFC21A]" />
                <span>Recorded Payments & Receipt Ledger</span>
              </h3>
              {balancePaisa > 0 && isAdmin && invoice.status !== 'CANCELLED' && (
                <Link to={`/payments/record?invoiceId=${invoice.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    <CreditCard className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
                    <span>Collect Payment</span>
                  </Button>
                </Link>
              )}
            </div>

            {!invoice.payments || invoice.payments.length === 0 ? (
              <div className="text-center py-6 px-4 bg-[#171717] rounded-lg border border-[#292929]">
                <p className="text-xs text-[#A5A5A5]">No payments recorded against this invoice yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoice.payments.map((pmt) => (
                  <div
                    key={pmt.id}
                    className="p-3.5 rounded-lg bg-[#171717] border border-[#292929] hover:border-[#333333] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#F5F5F5]">{pmt.paymentNumber}</span>
                        <StatusBadge status={pmt.status} type="payment" />
                      </div>
                      <p className="text-[11px] text-[#A5A5A5] mt-1">
                        Method: <span className="text-[#F5F5F5] font-medium">{formatPaymentMethod(pmt.method)}</span>
                        {' • '}
                        Date: {formatDate(pmt.paymentDate)}
                        {pmt.referenceNumber && (
                          <>
                            {' • '}
                            Ref / UTR: <span className="font-mono text-[#D4D4D4]">{pmt.referenceNumber}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="sm:text-right">
                        <p className="font-mono font-bold text-emerald-400 text-sm">
                          {formatCurrency(pmt.amountPaisa)}
                        </p>
                        <span className="text-[10px] text-[#737373]">Confirmed</span>
                      </div>
                      <Link
                        to={`/payments/${pmt.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FFC21A] hover:underline"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
