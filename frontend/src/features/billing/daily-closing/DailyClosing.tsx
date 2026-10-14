import React, { useState } from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
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
        <span className="font-semibold text-white text-xs">{formatDate(c.closingDate)}</span>
      ),
    },
    {
      key: 'totalCollectionsPaisa',
      header: 'Total Collections',
      render: (c: DailyClosing) => (
        <span className="font-bold text-emerald-400 text-xs">
          {formatCurrency(c.totalCollectionsPaisa)}
        </span>
      ),
    },
    {
      key: 'cashCollectionsPaisa',
      header: 'Cash Drawer',
      render: (c: DailyClosing) => (
        <span className="text-gray-300 text-xs">{formatCurrency(c.cashCollectionsPaisa)}</span>
      ),
    },
    {
      key: 'digitalCollectionsPaisa',
      header: 'Digital (UPI/Card)',
      render: (c: DailyClosing) => (
        <span className="text-gray-300 text-xs">{formatCurrency(c.digitalCollectionsPaisa)}</span>
      ),
    },
    {
      key: 'discrepancyPaisa',
      header: 'Variance',
      render: (c: DailyClosing) => {
        const disc = Number(c.discrepancyPaisa || 0);
        if (disc === 0) {
          return <span className="text-emerald-400 font-bold text-xs">₹0.00</span>;
        }
        return (
          <span className="text-rose-400 font-bold text-xs">
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
      header: 'Closed Timestamp',
      render: (c: DailyClosing) => (
        <span className="text-gray-400 text-xs">
          {c.closedAt ? formatDate(c.closedAt) : 'Pending'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Collection Closing</h2>
          <p className="text-xs text-gray-400">
            End-of-day register balancing and cash reconciliation for RV Fitness
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenModal}>
          <CalendarCheck className="w-4 h-4 mr-1.5" />
          <span>Execute Shift Closing</span>
        </Button>
      </div>

      <Card className="p-6 border-[#262626] bg-[#141414]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs text-[#F59E0B] font-semibold uppercase tracking-wider block">
              Today's Current Ledger Status
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {formatCurrency(todaySummary?.totalCollectionsPaisa || 0)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Cash: {formatCurrency(todaySummary?.cashCollectionsPaisa || 0)} • Digital: {formatCurrency(todaySummary?.digitalCollectionsPaisa || 0)}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-300">
            <div>
              <span className="text-gray-500 block">Invoices Issued Today</span>
              <span className="font-bold text-white text-base">{todaySummary?.invoicesIssued || 0}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Invoices Paid</span>
              <span className="font-bold text-emerald-400 text-base">{todaySummary?.invoicesPaid || 0}</span>
            </div>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={closings}
        isLoading={isLoading}
        emptyMessage="No daily closings recorded yet."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Close Register for Today"
      >
        <form onSubmit={handleExecuteClosing} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#161616] border border-[#222] text-xs space-y-1">
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Recorded System Collections
            </span>
            <div className="flex justify-between">
              <span className="text-gray-400">System Cash:</span>
              <span className="font-semibold text-white">
                {formatCurrency(todaySummary?.cashCollectionsPaisa || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">System Digital (UPI/Card):</span>
              <span className="font-semibold text-white">
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
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Shift Closing Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Evening shift hand-over complete, cash drawer locked"
              className="w-full p-2.5 text-xs rounded-lg bg-[#161616] border border-[#333] text-white focus:border-[#F59E0B]"
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
