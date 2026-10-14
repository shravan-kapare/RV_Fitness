import React, { useState } from 'react';
import { CalendarCheck, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import {
  useDailyClosings,
  useCloseDay,
  useTodayClosingSummary,
} from '@/hooks/useDailyClosing';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, rupeesToPaisa } from '@/lib/formatters';
import { DailyClosing } from '@/types';

export const DailyClosingView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [declaredCashRupees, setDeclaredCashRupees] = useState<number>(0);
  const [declaredDigitalRupees, setDeclaredDigitalRupees] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: closingsData, isLoading, refetch } = useDailyClosings();
  const { data: todaySummary } = useTodayClosingSummary();
  const { mutateAsync: closeDay, isPending } = useCloseDay();

  const closings: DailyClosing[] = Array.isArray(closingsData)
    ? closingsData
    : (closingsData as any)?.data || [];

  const handleOpenModal = () => {
    setError(null);
    if (todaySummary) {
      setDeclaredCashRupees(Number(todaySummary.cashCollectionsPaisa) / 100);
      setDeclaredDigitalRupees(Number(todaySummary.digitalCollectionsPaisa) / 100);
    }
    setIsModalOpen(true);
  };

  const handleExecuteClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      await closeDay({
        closingDate: todayStr,
        declaredCashPaisa: Number(rupeesToPaisa(declaredCashRupees)),
        declaredDigitalPaisa: Number(rupeesToPaisa(declaredDigitalRupees)),
        notes: notes || undefined,
      });

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to complete daily closing');
    }
  };

  const columns: Column<DailyClosing>[] = [
    {
      key: 'closingDate',
      header: 'Closing Date',
      render: (c: DailyClosing) => (
        <span className="font-semibold text-[#F5F5F5] text-xs">{formatDate(c.closingDate)}</span>
      ),
    },
    {
      key: 'totalCollectionsPaisa',
      header: 'Total Collections',
      align: 'right',
      render: (c: DailyClosing) => (
        <span className="font-mono font-bold tabular-nums text-emerald-400 text-xs">
          {formatCurrency(c.totalCollectionsPaisa)}
        </span>
      ),
    },
    {
      key: 'cashCollectionsPaisa',
      header: 'Cash Drawer',
      align: 'right',
      render: (c: DailyClosing) => (
        <span className="font-mono tabular-nums text-[#D4D4D4] text-xs">{formatCurrency(c.cashCollectionsPaisa)}</span>
      ),
    },
    {
      key: 'digitalCollectionsPaisa',
      header: 'Digital (UPI/Card)',
      align: 'right',
      render: (c: DailyClosing) => (
        <span className="font-mono tabular-nums text-[#D4D4D4] text-xs">{formatCurrency(c.digitalCollectionsPaisa)}</span>
      ),
    },
    {
      key: 'discrepancyPaisa',
      header: 'Closing Variance',
      align: 'right',
      render: (c: DailyClosing) => {
        const disc = Number(c.discrepancyPaisa || 0);
        if (disc === 0) {
          return <span className="font-mono font-bold text-emerald-400 text-xs">₹0.00</span>;
        }
        return (
          <span className="font-mono font-bold text-rose-400 text-xs">
            {disc > 0 ? `+${formatCurrency(disc)}` : formatCurrency(disc)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: DailyClosing) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            c.status === 'CLOSED' || c.status === 'VERIFIED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      key: 'closedAt',
      header: 'Timestamp',
      render: (c: DailyClosing) => (
        <span className="text-[#A5A5A5] text-xs font-mono">
          {c.closedAt ? formatDate(c.closedAt) : 'In Progress'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
            Daily Collection Closing
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            End-of-day register balancing and cash hand-over audit for RV Fitness
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenModal}>
          <CalendarCheck className="w-4 h-4 mr-1.5" />
          <span>Execute Shift Closing</span>
        </Button>
      </div>

      <div className="p-6 rounded-xl bg-[#111111] border border-[#292929]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] text-[#FFC21A] font-bold uppercase tracking-wider block">
              Today's Live Counter Total
            </span>
            <h3 className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5] mt-1">
              {formatCurrency(todaySummary?.totalCollectionsPaisa || 0)}
            </h3>
            <p className="text-xs font-mono text-[#A5A5A5] mt-1.5">
              Cash Drawer: <span className="text-[#F5F5F5]">{formatCurrency(todaySummary?.cashCollectionsPaisa || 0)}</span>
              {' • '}
              Digital (UPI/Card): <span className="text-[#F5F5F5]">{formatCurrency(todaySummary?.digitalCollectionsPaisa || 0)}</span>
            </p>
          </div>

          <div className="flex items-center gap-8 text-xs">
            <div className="p-3.5 rounded-lg bg-[#171717] border border-[#292929] text-center min-w-28">
              <span className="text-[10px] text-[#A5A5A5] uppercase font-bold block mb-1">Invoices Issued</span>
              <span className="font-black text-[#F5F5F5] text-xl font-mono">{todaySummary?.invoicesIssued || 0}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#171717] border border-[#292929] text-center min-w-28">
              <span className="text-[10px] text-[#A5A5A5] uppercase font-bold block mb-1">Invoices Settled</span>
              <span className="font-black text-emerald-400 text-xl font-mono">{todaySummary?.invoicesPaid || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={closings}
        isLoading={isLoading}
        emptyMessage="No daily closings recorded yet."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Execute Shift / Daily Register Closing"
      >
        <form onSubmit={handleExecuteClosing} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-[#171717] border border-[#292929] text-xs space-y-2">
            <span className="font-bold text-[10px] text-[#A5A5A5] uppercase tracking-wider block">
              System Ledger Counts for Today
            </span>
            <div className="flex justify-between">
              <span className="text-[#A5A5A5]">Expected Physical Cash:</span>
              <span className="font-mono font-bold text-[#F5F5F5]">
                {formatCurrency(todaySummary?.cashCollectionsPaisa || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A5A5A5]">Expected Digital Credits:</span>
              <span className="font-mono font-bold text-[#F5F5F5]">
                {formatCurrency(todaySummary?.digitalCollectionsPaisa || 0)}
              </span>
            </div>
          </div>

          <Input
            label="Declared Physical Cash in Drawer (₹) *"
            type="number"
            step="0.01"
            value={declaredCashRupees || ''}
            onChange={(e) => setDeclaredCashRupees(parseFloat(e.target.value) || 0)}
            required
          />

          <Input
            label="Declared Digital Collections (₹) *"
            type="number"
            step="0.01"
            value={declaredDigitalRupees || ''}
            onChange={(e) => setDeclaredDigitalRupees(parseFloat(e.target.value) || 0)}
            required
          />

          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-1.5">
              Shift Closing Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Closing handover complete, verified with night cashier..."
              className="w-full p-2.5 text-xs rounded-lg bg-[#171717] border border-[#292929] text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isPending}>
              Commit Daily Closing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
