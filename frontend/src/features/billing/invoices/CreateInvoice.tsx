import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Check, User as UserIcon, FileSpreadsheet } from 'lucide-react';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { useMembers } from '@/hooks/useMembers';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatCurrency, rupeesToPaisa } from '@/lib/formatters';

interface FormLineItem {
  planId?: string;
  description: string;
  quantity: number;
  unitPriceRupees: number;
  taxRateBps: number;
  discountRupees: number;
}

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: createInvoice, isPending } = useCreateInvoice();
  const { data: memberRes } = useMembers();
  const { data: planRes } = useMembershipPlans();

  const members = memberRes?.data || [];
  const plans = Array.isArray(planRes) ? planRes : (planRes as any)?.data || [];

  const [memberId, setMemberId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<FormLineItem[]>([
    {
      description: '',
      quantity: 1,
      unitPriceRupees: 0,
      taxRateBps: 1800, // 18% default GST
      discountRupees: 0,
    },
  ]);

  const handlePlanSelect = (index: number, planId: string) => {
    const selectedPlan = plans.find((p: any) => p.id === planId);
    const updated = [...items];
    if (selectedPlan) {
      updated[index] = {
        ...updated[index],
        planId: selectedPlan.id,
        description: selectedPlan.name,
        unitPriceRupees: Number(selectedPlan.pricePaisa) / 100,
        taxRateBps: selectedPlan.taxRateBps || 1800,
      };
    } else {
      updated[index].planId = undefined;
    }
    setItems(updated);
  };

  const updateItem = (index: number, fields: Partial<FormLineItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...fields };
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPriceRupees: 0,
        taxRateBps: 1800,
        discountRupees: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations in paisa
  const calculatedItems = items.map((it) => {
    const unitPricePaisa = rupeesToPaisa(it.unitPriceRupees || 0);
    const subtotal = unitPricePaisa * (it.quantity || 1);
    const discount = rupeesToPaisa(it.discountRupees || 0);
    const taxable = subtotal > discount ? subtotal - discount : 0;
    const tax = Math.round((taxable * (it.taxRateBps || 0)) / 10000);
    const total = taxable + tax;
    return { subtotal, discount, tax, total };
  });

  const subtotalPaisa = calculatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const discountPaisa = calculatedItems.reduce((acc, curr) => acc + curr.discount, 0);
  const taxPaisa = calculatedItems.reduce((acc, curr) => acc + curr.tax, 0);
  const totalPaisa = calculatedItems.reduce((acc, curr) => acc + curr.total, 0);

  const handleSubmit = async () => {
    setError(null);
    if (!memberId) {
      setError('Please select a gym member');
      return;
    }
    if (items.some((it) => !it.description || it.unitPriceRupees <= 0)) {
      setError('Please provide a valid description and price for all line items');
      return;
    }

    try {
      const payload = {
        memberId,
        dueDate: new Date(dueDate).toISOString(),
        notes: notes || undefined,
        internalNotes: internalNotes || undefined,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unitPricePaisa: Number(rupeesToPaisa(it.unitPriceRupees)),
          taxRateBps: Number(it.taxRateBps) || 0,
          discountPaisa: Number(rupeesToPaisa(it.discountRupees || 0)),
        })),
      };

      const res = await createInvoice(payload);
      navigate(`/invoices/${res.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to create invoice';
      setError(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Invoices</span>
          </Button>
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">Create Member Invoice</h2>
            <p className="text-xs text-[#A5A5A5]">Issue an itemized invoice with snapshot pricing</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Member & Due Date Section */}
      <Card className="p-5 border-[#292929]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A5A5A5] mb-3 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[#FFC21A]" />
          <span>Member Profile & Payment Terms</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5A5A5] mb-1.5">
              Select Member <span className="text-rose-400">*</span>
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#171717] border border-[#292929] text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A] focus:ring-1 focus:ring-[#FFC21A]"
            >
              <option value="">-- Select Member Account --</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.user?.fullName} ({m.memberCode}) • {m.user?.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Payment Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>
      </Card>

      {/* Itemized Lines Section */}
      <Card className="p-5 border-[#292929]">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#222222]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A5A5A5] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#FFC21A]" />
            <span>Line Items & Membership Packages</span>
          </h3>
          <Button variant="secondary" size="sm" onClick={addItem}>
            <Plus className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
            <span>Add Item</span>
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
            >
              <div className="md:col-span-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
                  Preset Package (Optional)
                </label>
                <select
                  value={it.planId || ''}
                  onChange={(e) => handlePlanSelect(idx, e.target.value)}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#292929] text-[#F5F5F5] focus:border-[#FFC21A]"
                >
                  <option value="">Custom Item</option>
                  {plans.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{Number(p.pricePaisa) / 100})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Gym Access"
                  value={it.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className="w-full h-9 px-2.5 text-xs rounded-md bg-[#1C1C1C] border border-[#292929] text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1">
                  Unit Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.unitPriceRupees}
                  onChange={(e) => updateItem(idx, { unitPriceRupees: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-2.5 text-xs rounded-md bg-[#1C1C1C] border border-[#292929] text-[#F5F5F5] tabular-nums focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#292929] text-[#F5F5F5] text-center tabular-nums focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1">GST %</label>
                <select
                  value={it.taxRateBps}
                  onChange={(e) => updateItem(idx, { taxRateBps: parseInt(e.target.value, 10) || 0 })}
                  className="w-full h-9 px-1 text-xs rounded-md bg-[#1C1C1C] border border-[#292929] text-[#F5F5F5] focus:border-[#FFC21A]"
                >
                  <option value={0}>0%</option>
                  <option value={500}>5%</option>
                  <option value={1200}>12%</option>
                  <option value={1800}>18%</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#737373] mb-1">Disc (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={it.discountRupees}
                  onChange={(e) => updateItem(idx, { discountRupees: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#292929] text-[#F5F5F5] tabular-nums focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  className="h-9 w-9 flex items-center justify-center rounded-md text-[#737373] hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 cursor-pointer transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card className="p-5 border-[#292929] space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5A5A5] mb-1.5">
              Member Visible Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes locker access and induction session"
              className="w-full p-2.5 text-xs rounded-lg bg-[#171717] border border-[#292929] text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5A5A5] mb-1.5">
              Internal Staff Remarks
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal remarks for accounts..."
              className="w-full p-2.5 text-xs rounded-lg bg-[#171717] border border-[#292929] text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
            />
          </div>
        </Card>

        {/* Financial Calculation Summary */}
        <Card className="p-5 border-[#292929] space-y-3 bg-[#111111]">
          <div className="flex justify-between text-xs text-[#A5A5A5]">
            <span>Items Subtotal:</span>
            <span className="text-[#F5F5F5] font-semibold tabular-nums">{formatCurrency(subtotalPaisa)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#A5A5A5]">
            <span>Discounts Deducted:</span>
            <span className="text-amber-400 font-semibold tabular-nums">-{formatCurrency(discountPaisa)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#A5A5A5]">
            <span>Applicable GST / Taxes:</span>
            <span className="text-[#F5F5F5] font-semibold tabular-nums">+{formatCurrency(taxPaisa)}</span>
          </div>
          <div className="pt-3 border-t border-[#222222] flex justify-between text-base font-bold text-[#F5F5F5]">
            <span>Total Payable:</span>
            <span className="text-[#FFC21A] tabular-nums">{formatCurrency(totalPaisa)}</span>
          </div>

          <div className="pt-3">
            <Button
              variant="primary"
              className="w-full justify-center"
              isLoading={isPending}
              onClick={handleSubmit}
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>Issue Invoice</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
