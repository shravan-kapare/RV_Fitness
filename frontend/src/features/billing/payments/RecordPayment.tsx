import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Banknote, QrCode, Building, AlertCircle } from 'lucide-react';
import { useInvoices, useInvoice } from '@/hooks/useInvoices';
import { useRecordPayment } from '@/hooks/usePayments';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PaymentMethod, Invoice } from '@/types';
import { formatCurrency, rupeesToPaisa } from '@/lib/formatters';

export const RecordPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prefilledInvoiceId = searchParams.get('invoiceId') || '';

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(prefilledInvoiceId);
  const [amountRupees, setAmountRupees] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: invoiceRes } = useInvoices({ limit: 100 });
  const { data: activeInvoice } = useInvoice(selectedInvoiceId);
  const { mutateAsync: recordPayment, isPending } = useRecordPayment();

  const invoices: Invoice[] = invoiceRes?.data || [];

  const payableInvoices = invoices.filter(
    (inv: Invoice) => inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'DRAFT'
  );

  useEffect(() => {
    if (activeInvoice) {
      const remainingPaisa = Number(activeInvoice.totalPaisa) - Number(activeInvoice.paidPaisa);
      setAmountRupees(remainingPaisa > 0 ? remainingPaisa / 100 : 0);
    }
  }, [activeInvoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedInvoiceId) {
      setError('Please select an invoice to settle');
      return;
    }
    if (amountRupees <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    if ((method === 'UPI' || method === 'BANK_TRANSFER' || method === 'CARD') && !referenceNumber) {
      setError(`UTR / Reference identifier is mandatory for ${method} transactions`);
      return;
    }

    try {
      const amountPaisa = Number(rupeesToPaisa(amountRupees));
      const res = await recordPayment({
        invoiceId: selectedInvoiceId,
        amountPaisa,
        method,
        paymentDate: new Date().toISOString(),
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });

      navigate(`/payments/${res.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to record payment transaction');
    }
  };

  const getMethodIcon = (m: PaymentMethod) => {
    switch (m) {
      case 'CASH':
        return <Banknote className="w-4 h-4 mr-1.5" />;
      case 'UPI':
        return <QrCode className="w-4 h-4 mr-1.5" />;
      case 'CARD':
        return <CreditCard className="w-4 h-4 mr-1.5" />;
      case 'BANK_TRANSFER':
        return <Building className="w-4 h-4 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Go Back</span>
        </Button>
        <div>
          <h1 className="text-xl font-black text-[#F5F5F5] uppercase tracking-tight">
            Record Member Payment
          </h1>
          <p className="text-xs text-[#A5A5A5]">
            Front-desk settlement collection for RV Fitness members
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 border-[#292929] bg-[#111111]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-2">
              Select Invoice to Settle <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-[#171717] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A] transition-colors"
              required
            >
              <option value="">-- Choose Payable Invoice --</option>
              {payableInvoices.map((inv: Invoice) => {
                const bal = Number(inv.totalPaisa) - Number(inv.paidPaisa);
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.member?.user?.fullName} (Due: ₹{(bal / 100).toFixed(2)})
                  </option>
                );
              })}
            </select>
          </div>

          {activeInvoice && (
            <div className="p-4 rounded-lg bg-[#171717] border border-[#292929] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Member Name:</span>
                <span className="font-semibold text-[#F5F5F5]">{activeInvoice.member?.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Total Invoiced:</span>
                <span className="font-mono text-[#F5F5F5]">{formatCurrency(activeInvoice.totalPaisa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Previously Settled:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(activeInvoice.paidPaisa)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#292929] font-bold text-sm">
                <span className="text-[#A5A5A5]">Outstanding Balance:</span>
                <span className="font-mono text-[#FFC21A]">
                  {formatCurrency(Number(activeInvoice.totalPaisa) - Number(activeInvoice.paidPaisa))}
                </span>
              </div>
            </div>
          )}

          <div>
            <Input
              label="Collection Amount (₹) *"
              type="number"
              step="0.01"
              min="1"
              value={amountRupees || ''}
              onChange={(e) => setAmountRupees(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-2">
              Payment Method <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'] as PaymentMethod[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    method === m
                      ? 'bg-[#FFC21A] border-[#FFC21A] text-[#080808] shadow-md font-bold'
                      : 'bg-[#171717] border-[#292929] text-[#A5A5A5] hover:text-[#F5F5F5] hover:border-[#3B3B3B]'
                  }`}
                >
                  {getMethodIcon(m)}
                  <span>{m === 'BANK_TRANSFER' ? 'BANK' : m}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label={method === 'CASH' ? 'Desk Note / Cash Receipt Voucher (Optional)' : 'UTR / Transaction Reference (Mandatory) *'}
              placeholder={method === 'UPI' ? 'e.g. 402918239012' : method === 'CARD' ? 'Auth code / Last 4 digits' : 'Bank transaction reference'}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required={method !== 'CASH'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-1.5">
              Staff Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Received at Narsobawadi desk..."
              className="w-full p-3 text-xs rounded-lg bg-[#171717] border border-[#292929] text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A] transition-colors"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
              className="w-full justify-center h-12 text-sm font-bold uppercase tracking-wider"
            >
              <Check className="w-4 h-4 mr-2" />
              <span>Record & Generate Receipt</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
