import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, AlertCircle, ArrowUpRight, Filter } from 'lucide-react';
import { useOutstandingReport } from '@/hooks/useReports';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Invoice } from '@/types';

export const OutstandingBalances: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAging, setSelectedAging] = useState<string>('ALL');

  const { data: report, isLoading } = useOutstandingReport();

  // Flatten all invoices across buckets from the backend report
  const rawInvoices = (report?.buckets || []).flatMap((b) => b.invoices || []);
  const now = new Date();
  const invoicesWithAging = rawInvoices.map((inv: any) => {
    const due = new Date(inv.dueDate);
    const diffTime = now.getTime() - due.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    let bucket = 'CURRENT';
    if (daysOverdue > 90) bucket = '90+';
    else if (daysOverdue > 60) bucket = '61-90';
    else if (daysOverdue > 30) bucket = '31-60';
    else if (daysOverdue > 0) bucket = '1-30';

    return {
      ...inv,
      daysOverdue,
      bucket,
      balancePaisa: Number(inv.totalPaisa) - Number(inv.paidPaisa),
    };
  });

  const filteredInvoices = invoicesWithAging.filter((inv: any) => {
    if (selectedAging === 'ALL') return true;
    return inv.bucket === selectedAging;
  });

  const agingBuckets = [
    { id: 'ALL', label: 'All Outstanding', count: invoicesWithAging.length },
    {
      id: 'CURRENT',
      label: 'Current (Not Due)',
      count: invoicesWithAging.filter((i: any) => i.bucket === 'CURRENT').length,
    },
    {
      id: '1-30',
      label: '1 - 30 Days Overdue',
      count: invoicesWithAging.filter((i: any) => i.bucket === '1-30').length,
    },
    {
      id: '31-60',
      label: '31 - 60 Days Overdue',
      count: invoicesWithAging.filter((i: any) => i.bucket === '31-60').length,
    },
    {
      id: '61-90',
      label: '61 - 90 Days Overdue',
      count: invoicesWithAging.filter((i: any) => i.bucket === '61-90').length,
    },
    {
      id: '90+',
      label: '90+ Days Critical',
      count: invoicesWithAging.filter((i: any) => i.bucket === '90+').length,
    },
  ];

  const columns: Column<any>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => (
        <span className="font-semibold text-white tracking-wide">{inv.invoiceNumber}</span>
      ),
    },
    {
      key: 'member',
      header: 'Member',
      render: (inv) => (
        <div>
          <p className="text-white font-medium">{inv.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[11px] text-gray-400">{inv.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'totalPaisa',
      header: 'Invoice Total',
      render: (inv) => (
        <span className="text-gray-300 font-medium">{formatCurrency(inv.totalPaisa)}</span>
      ),
    },
    {
      key: 'paidPaisa',
      header: 'Amount Paid',
      render: (inv) => (
        <span className="text-emerald-400 font-medium">{formatCurrency(inv.paidPaisa)}</span>
      ),
    },
    {
      key: 'balancePaisa',
      header: 'Outstanding Balance',
      render: (inv) => (
        <span className="font-bold text-amber-400">{formatCurrency(inv.balancePaisa)}</span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => <span className="text-gray-300 text-xs">{formatDate(inv.dueDate)}</span>,
    },
    {
      key: 'daysOverdue',
      header: 'Aging Category',
      render: (inv) => {
        if (inv.daysOverdue === 0) {
          return (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Not Due
            </span>
          );
        }
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              inv.daysOverdue > 60
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {inv.daysOverdue} days overdue
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/payments/record?invoiceId=${inv.id}`)}
            className="text-xs px-2.5 py-1 h-auto"
          >
            Collect
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/invoices/${inv.id}`)}
            className="text-xs px-2 py-1 h-auto text-gray-400 hover:text-white"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Outstanding Balances & Aging</h2>
        <p className="text-xs text-gray-400">
          Monitor uncollected gym dues categorized by payment delinquency brackets
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-[#262626]">
          <span className="text-xs text-gray-400 font-medium block">Total Receivables</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {formatCurrency(report?.totalOutstandingPaisa || 0)}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Across {invoicesWithAging.length} open invoices
          </span>
        </Card>

        <Card className="p-5 border-[#262626]">
          <span className="text-xs text-gray-400 font-medium block">Overdue Invoices</span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">
            {invoicesWithAging.filter((i: any) => i.daysOverdue > 0).length}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Past scheduled due date</span>
        </Card>

        <Card className="p-5 border-[#262626]">
          <span className="text-xs text-gray-400 font-medium block">Current (Within Term)</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {invoicesWithAging.filter((i: any) => i.daysOverdue === 0).length}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Awaiting payment term</span>
        </Card>
      </div>

      {/* Aging Category Filters */}
      <div className="flex flex-wrap gap-2">
        {agingBuckets.map((bucket) => (
          <button
            key={bucket.id}
            onClick={() => setSelectedAging(bucket.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              selectedAging === bucket.id
                ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                : 'bg-[#141414] border-[#2E2E2E] text-gray-300 hover:bg-[#1C1C1C]'
            }`}
          >
            <span>{bucket.label}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#222] text-[10px] text-gray-300 font-bold">
              {bucket.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredInvoices}
        isLoading={isLoading}
        emptyMessage="No outstanding invoices in this aging bracket."
      />
    </div>
  );
};
