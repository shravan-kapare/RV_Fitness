import React, { useState } from 'react';
import { History, Shield, Filter, Search, Terminal } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAudit';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { formatDateTime } from '@/lib/formatters';
import { AuditLog } from '@/types';

export const AuditHistory: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState<string>('ALL');

  const { data: response, isLoading } = useAuditLogs({
    page,
    limit: 15,
    entityType: entityType === 'ALL' ? undefined : entityType,
  });

  const logs: AuditLog[] = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (log) => (
        <span className="text-[#A5A5A5] text-xs font-mono">{formatDateTime(log.createdAt)}</span>
      ),
    },
    {
      key: 'user',
      header: 'Staff / Operator',
      render: (log) => (
        <div>
          <span className="text-[#F5F5F5] font-semibold text-xs">
            {log.user?.fullName || 'System Automated'}
          </span>
          <p className="text-[10px] font-mono text-[#737373]">{log.user?.role || 'SYSTEM'}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Operation',
      render: (log) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            log.action.includes('CONFIRM') || log.action.includes('CREATE') || log.action.includes('ISSUE')
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : log.action.includes('REVERSE') || log.action.includes('CANCEL') || log.action.includes('REJECT')
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {log.action}
        </span>
      ),
    },
    {
      key: 'entityType',
      header: 'Target Entity',
      render: (log) => (
        <span className="text-[#D4D4D4] text-xs font-mono">
          {log.entityType} <span className="text-[#737373]">({log.entityId ? log.entityId.slice(0, 8) + '...' : 'Global'})</span>
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Payload Details',
      render: (log) => {
        return (
          <div className="max-w-md truncate text-[11px] text-[#A5A5A5] font-mono" title={log.newValues ? JSON.stringify(log.newValues) : ''}>
            {log.newValues ? JSON.stringify(log.newValues) : 'Record mutated / created'}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
          Immutable Audit Trail
        </h1>
        <p className="text-xs text-[#A5A5A5] mt-0.5">
          Tamper-evident ledger log tracking all financial transactions, status mutations, and admin overrides
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#292929]">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[10px] text-[#A5A5A5]">
            Filter Scope:
          </label>
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="h-8 px-2.5 rounded bg-[#171717] border border-[#292929] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
          >
            <option value="ALL">All Entities</option>
            <option value="INVOICE">Invoices</option>
            <option value="PAYMENT">Payments</option>
            <option value="RECEIPT">Receipts</option>
            <option value="REFUND">Refunds</option>
            <option value="RECONCILIATION">Reconciliation</option>
            <option value="DAILY_CLOSING">Daily Closing</option>
            <option value="SETTING">Settings</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="No audit log entries recorded for this filter."
      />

      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
