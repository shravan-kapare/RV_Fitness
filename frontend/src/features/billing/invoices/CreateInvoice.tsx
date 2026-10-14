import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Check, User as UserIcon } from 'lucide-react';
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

  // Calculations
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
      const invoiceId = res.id;
      navigate(`/invoices/${invoiceId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create invoice');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Invoices</span>
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create Member Invoice</h2>
          <p className="text-xs text-gray-400">Generate an itemized invoice with snapshot pricing</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Member & Date Section */}
      <Card className="p-6 border-[#262626]">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[#F59E0B]" />
          <span>Member & Due Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Select Member <span className="text-red-400">*</span>
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#161616] border border-[#333] text-sm text-white focus:outline-none focus:border-[#F59E0B]"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.user?.fullName} ({m.memberCode}) - {m.user?.email}
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
      <Card className="p-6 border-[#262626]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Itemized Plans & Services</h3>
          <Button variant="secondary" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Item</span>
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#161616] border border-[#262626] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
            >
              <div className="md:col-span-3">
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Preset Plan (Optional)
                </label>
                <select
                  value={it.planId || ''}
                  onChange={(e) => handlePlanSelect(idx, e.target.value)}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#333] text-white focus:border-[#F59E0B]"
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
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Gym Access"
                  value={it.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#333] text-white focus:border-[#F59E0B]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Unit Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.unitPriceRupees}
                  onChange={(e) => updateItem(idx, { unitPriceRupees: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#333] text-white focus:border-[#F59E0B]"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#333] text-white focus:border-[#F59E0B]"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[11px] font-medium text-gray-400 mb-1">GST %</label>
                <select
                  value={it.taxRateBps}
                  onChange={(e) => updateItem(idx, { taxRateBps: parseInt(e.target.value, 10) || 0 })}
                  className="w-full h-9 px-1 text-xs rounded-md bg-[#1C1C1C] border border-[#333] text-white focus:border-[#F59E0B]"
                >
                  <option value={0}>0%</option>
                  <option value={500}>5%</option>
                  <option value={1200}>12%</option>
                  <option value={1800}>18%</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Disc (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={it.discountRupees}
                  onChange={(e) => updateItem(idx, { discountRupees: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-2 text-xs rounded-md bg-[#1C1C1C] border border-[#333] text-white focus:border-[#F59E0B]"
                />
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  className="h-9 w-9 flex items-center justify-center rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card className="p-6 border-[#262626] space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Member Visible Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes locker access and gym induction"
              className="w-full p-2.5 text-xs rounded-lg bg-[#161616] border border-[#333] text-white focus:border-[#F59E0B]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Internal Staff Notes</label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal remarks for accounts..."
              className="w-full p-2.5 text-xs rounded-lg bg-[#161616] border border-[#333] text-white focus:border-[#F59E0B]"
            />
          </div>
        </Card>

        <Card className="p-6 border-[#262626] space-y-3">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotalPaisa)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-300">
            <span>Discount Applied:</span>
            <span className="text-amber-400">-{formatCurrency(discountPaisa)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-300">
            <span>GST / Taxes:</span>
            <span>+{formatCurrency(taxPaisa)}</span>
          </div>
          <div className="pt-3 border-t border-[#333] flex justify-between text-base font-bold text-white">
            <span>Total Payable:</span>
            <span className="text-[#F59E0B]">{formatCurrency(totalPaisa)}</span>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="primary"
              className="flex-1 justify-center"
              isLoading={isPending}
              onClick={handleSubmit}
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>Create Invoice</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
