import React, { useState } from 'react';
import { Plus, Scale, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  useReconciliations,
  useCreateReconciliation,
  useResolveReconciliation,
} from '@/hooks/useReconciliation';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, rupeesToPaisa } from '@/lib/formatters';
import { ReconciliationRecord } from '@/types';

export const PaymentReconciliation: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reconciliationDate, setReconciliationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [declaredCashRupees, setDeclaredCashRupees] = useState<number>(0);
  const [declaredDigitalRupees, setDeclaredDigitalRupees] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: response, isLoading, refetch } = useReconciliations();
  const { mutateAsync: createReconciliation, isPending } = useCreateReconciliation();
  const { mutateAsync: resolveDiscrepancy } = useResolveReconciliation();

  const records: ReconciliationRecord[] = response?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createReconciliation({
        reconciliationDate: new Date(reconciliationDate).toISOString(),
        declaredCashPaisa: Number(rupeesToPaisa(declaredCashRupees)),
        declaredDigitalPaisa: Number(rupeesToPaisa(declaredDigitalRupees)),
        notes: notes || undefined,
      });
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate reconciliation');
    }
  };

  const handleResolve = async (id: string) => {
    const resolutionNotes = prompt('Enter reconciliation resolution remarks:');
    if (!resolutionNotes) return;
    await resolveDiscrepancy({ id, notes: resolutionNotes });
    refetch();
  };

  const columns: Column<ReconciliationRecord>[] = [
    {
      key: 'reconciliationDate',
      header: 'Audit Date',
      render: (r: ReconciliationRecord) => (
        <span className="font-semibold text-[#F5F5F5] text-xs">{formatDate(r.reconciliationDate)}</span>
      ),
    },
    {
      key: 'period',
      header: 'Audit Period',
      render: (r: ReconciliationRecord) => (
        <span className="text-[#A5A5A5] text-xs">
          {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
        </span>
      ),
    },
    {
      key: 'recordedTotalPaisa',
      header: 'Ledger Recorded',
      align: 'right',
      render: (r: ReconciliationRecord) => (
        <span className="font-mono font-bold tabular-nums text-[#F5F5F5] text-xs">
          {formatCurrency(r.recordedTotalPaisa)}
        </span>
      ),
    },
    {
      key: 'declaredTotalPaisa',
      header: 'Declared Total',
      align: 'right',
      render: (r: ReconciliationRecord) => (
        <span className="font-mono tabular-nums text-[#A5A5A5] text-xs">
          {r.declaredTotalPaisa ? formatCurrency(r.declaredTotalPaisa) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'discrepancyPaisa',
      header: 'Variance',
      align: 'right',
      render: (r: ReconciliationRecord) => {
        const disc = Number(r.discrepancyPaisa || 0);
        if (disc === 0) {
          return <span className="font-mono font-bold text-emerald-400 text-xs">₹0.00 (Balanced)</span>;
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
      header: 'Audit Status',
      render: (r: ReconciliationRecord) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            r.status === 'MATCHED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : r.status === 'DISCREPANCY'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r: ReconciliationRecord) => (
        <div className="flex items-center justify-end">
          {r.status === 'DISCREPANCY' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleResolve(r.id)}
              className="text-xs px-2.5 py-1 h-auto text-amber-400 hover:text-white"
            >
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
            Payment Reconciliation
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Audit system ledger records against physical cash drawers and bank statements
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Reconciliation Audit</span>
        </Button>
      </div>

      <Table
        columns={columns}
        data={records}
        isLoading={isLoading}
        emptyMessage="No reconciliation audits conducted yet."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Conduct Financial Reconciliation Audit"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Input
              label="Audit Date *"
              type="date"
              value={reconciliationDate}
              onChange={(e) => setReconciliationDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Declared Physical Cash Handover (₹)"
            type="number"
            step="0.01"
            value={declaredCashRupees || ''}
            onChange={(e) => setDeclaredCashRupees(parseFloat(e.target.value) || 0)}
          />

          <Input
            label="Declared Bank / UPI Digital Credits (₹)"
            type="number"
            step="0.01"
            value={declaredDigitalRupees || ''}
            onChange={(e) => setDeclaredDigitalRupees(parseFloat(e.target.value) || 0)}
          />

          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-1.5">
              Auditor Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified against SBI Current Account & cash drawer counter..."
              className="w-full p-2.5 text-xs rounded-lg bg-[#171717] border border-[#292929] text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isPending}>
              Run Variance Check
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
