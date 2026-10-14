import React, { useState } from 'react';
import { History, Shield, Filter, Search } from 'lucide-react';
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
        <span className="text-gray-300 text-xs font-mono">{formatDateTime(log.createdAt)}</span>
      ),
    },
    {
      key: 'user',
      header: 'Operator',
      render: (log) => (
        <div>
          <span className="text-white font-medium text-xs">
            {log.user?.fullName || 'System Event'}
          </span>
          <p className="text-[10px] text-gray-500">{log.user?.role || 'SYSTEM'}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Executed',
      render: (log) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            log.action.includes('CONFIRM') || log.action.includes('CREATE')
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
        <span className="text-gray-300 text-xs">
          {log.entityType} ({log.entityId ? log.entityId.slice(0, 8) + '...' : 'Global'})
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Audit Snapshot',
      render: (log) => {
        return (
          <div className="max-w-md truncate text-[11px] text-gray-400 font-mono">
            {log.newValues ? JSON.stringify(log.newValues) : 'Record created / altered'}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Immutable Audit Trail</h2>
        <p className="text-xs text-gray-400">
          Cryptographically referenced event log tracking all financial operations and administrative mutations
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#262626]">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Filter Domain:</label>
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="h-8 px-2.5 rounded bg-[#161616] border border-[#333] text-xs text-white"
          >
            <option value="ALL">All Entities</option>
            <option value="INVOICE">Invoices</option>
            <option value="PAYMENT">Payments</option>
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
        emptyMessage="No audit logs recorded for this criteria."
      />

      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
