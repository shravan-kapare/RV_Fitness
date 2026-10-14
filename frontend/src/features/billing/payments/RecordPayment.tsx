import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
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
      setError('Please select an invoice to apply payment to');
      return;
    }
    if (amountRupees <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    if ((method === 'UPI' || method === 'BANK_TRANSFER' || method === 'CARD') && !referenceNumber) {
      setError(`Reference / Transaction number is required for ${method} offline payments`);
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
      setError(err.response?.data?.message || err.message || 'Failed to record payment');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Go Back</span>
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Record Member Payment</h2>
          <p className="text-xs text-gray-400">
            Log an offline cash, UPI, card, or bank settlement
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      <Card className="p-6 border-[#262626]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Select Invoice to Settle <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#161616] border border-[#333] text-sm text-white focus:outline-none focus:border-[#F59E0B]"
              required
            >
              <option value="">-- Choose Payable Invoice --</option>
              {payableInvoices.map((inv: Invoice) => {
                const bal = Number(inv.totalPaisa) - Number(inv.paidPaisa);
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.member?.user?.fullName} (Bal: ₹{bal / 100})
                  </option>
                );
              })}
            </select>
          </div>

          {activeInvoice && (
            <div className="p-4 rounded-xl bg-[#161616] border border-[#222] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Member:</span>
                <span className="font-semibold text-white">{activeInvoice.member?.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Invoice Total:</span>
                <span className="text-white">{formatCurrency(activeInvoice.totalPaisa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Previously Paid:</span>
                <span className="text-emerald-400">{formatCurrency(activeInvoice.paidPaisa)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#333] font-bold">
                <span className="text-gray-300">Remaining Balance:</span>
                <span className="text-[#F59E0B]">
                  {formatCurrency(Number(activeInvoice.totalPaisa) - Number(activeInvoice.paidPaisa))}
                </span>
              </div>
            </div>
          )}

          <div>
            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              min="1"
              value={amountRupees || ''}
              onChange={(e) => setAmountRupees(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Payment Method <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['CASH', 'UPI', 'BANK_TRANSFER', 'CARD'] as PaymentMethod[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    method === m
                      ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                      : 'bg-[#161616] border-[#333] text-gray-300 hover:bg-[#222]'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label={method === 'CASH' ? 'Receipt Voucher / Desk Note (Optional)' : 'UTR / Transaction Reference *'}
              placeholder={method === 'UPI' ? 'e.g. 332456789012' : 'Reference identifier'}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required={method !== 'CASH'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Staff Remarks / Memo
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Received at front counter..."
              className="w-full p-2.5 text-xs rounded-lg bg-[#161616] border border-[#333] text-white focus:border-[#F59E0B]"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
              className="w-full justify-center h-11 text-sm font-semibold"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>Record & Confirm Settlement</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
