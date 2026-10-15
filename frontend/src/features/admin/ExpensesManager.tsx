import React, { useState } from 'react';
import { useExpenses, useExpenseSummary, useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/formatters';
import { DollarSign, Plus, Trash2, Calendar, Tag, CreditCard, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExpensesManager: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('EQUIPMENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');

  const { data: expensesData, isLoading } = useExpenses();
  const { data: summary } = useExpenseSummary();
  const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
  const { mutate: deleteExpense } = useDeleteExpense();

  const expenses = expensesData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpense({
      category,
      title,
      description,
      amountRupees: parseFloat(amountRupees),
      expenseDate,
      paymentMethod,
      referenceNumber,
    }, {
      onSuccess: () => {
        setModalOpen(false);
        setTitle('');
        setAmountRupees('');
        setReferenceNumber('');
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-wider">
            Operational Outflows
          </span>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase mt-1">
            Operational Expenses
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Track equipment purchases, facility maintenance, rent, utilities, and trainer salaries.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#FFC21A] text-black font-extrabold text-sm shadow-md shadow-[#FFC21A]/10 hover:bg-[#e5ad16] transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <span className="text-xs font-semibold text-[#888] uppercase">Total Operational Outflow</span>
          <p className="text-3xl font-black font-mono tabular-nums text-[#FFC21A] mt-2">
            {formatCurrency(summary?.totalExpensePaisa || 0)}
          </p>
          <p className="text-xs text-[#888] mt-1">Authorized gym disbursements</p>
        </div>

        {summary?.categoryBreakdown?.slice(0, 3).map((item) => (
          <div key={item.category} className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
            <span className="text-xs font-semibold text-[#888] uppercase">{item.category}</span>
            <p className="text-2xl font-black font-mono tabular-nums text-[#F5F5F5] mt-2">
              {formatCurrency(item.amountPaisa)}
            </p>
            <span className="text-[10px] text-amber-400 font-mono">Category allocation</span>
          </div>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
        <h2 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3 mb-6">
          Disbursement Log
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-[#171717] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#888]">
            <p>No expense disbursements recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#A5A5A5]">
              <thead className="bg-[#171717] text-xs uppercase font-mono text-[#888] border-b border-[#292929]">
                <tr>
                  <th className="py-3 px-4">Expense #</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title / Purpose</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {expenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-[#171717]/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#FFC21A]">{e.expenseNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1c1c1c] text-[#CCCCCC]">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#F5F5F5] font-semibold">{e.title}</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-400 tabular-nums">
                      {formatCurrency(e.amountPaisa)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {new Date(e.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#888]">{e.paymentMethod}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense record ${e.expenseNumber}?`)) {
                            deleteExpense(e.id);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-red-500/10 text-[#666] hover:text-red-400 transition"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Record Expense */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <h3 className="text-xl font-bold text-[#F5F5F5]">Record Operational Expense</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#888] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  >
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="SALARY">SALARY</option>
                    <option value="RENT">RENT</option>
                    <option value="UTILITIES">UTILITIES</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="SUPPLEMENTS">SUPPLEMENTS</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Title / Expense Item *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Olympic Barbell Spring Collars replacement"
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Reference / UTR Number</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UTR-9876543210"
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#888]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition disabled:opacity-50"
                >
                  {isCreating ? 'Saving...' : 'Authorize Disbursement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
