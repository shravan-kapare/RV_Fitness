import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, AlertTriangle, AlertCircle, ArrowUpRight, CreditCard, ChevronRight } from 'lucide-react';
import { useOutstandingReport } from '@/hooks/useReports';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';

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
    { id: 'ALL', label: 'All Dues', count: invoicesWithAging.length },
    {
      id: 'CURRENT',
      label: 'Current (Not Due)',
      count: invoicesWithAging.filter((i: any) => i.bucket === 'CURRENT').length,
    },
    {
      id: '1-30',
      label: '1 – 30 Days',
      count: invoicesWithAging.filter((i: any) => i.bucket === '1-30').length,
    },
    {
      id: '31-60',
      label: '31 – 60 Days',
      count: invoicesWithAging.filter((i: any) => i.bucket === '31-60').length,
    },
    {
      id: '61-90',
      label: '61 – 90 Days',
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
        <span className="font-mono font-bold text-[#F5F5F5] text-xs tracking-wide">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'member',
      header: 'Member Name',
      render: (inv) => (
        <div>
          <p className="text-[#F5F5F5] font-semibold text-xs">{inv.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[10px] font-mono text-[#A5A5A5]">{inv.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'totalPaisa',
      header: 'Billed',
      align: 'right',
      render: (inv) => (
        <span className="font-mono tabular-nums text-xs text-[#A5A5A5]">
          {formatCurrency(inv.totalPaisa)}
        </span>
      ),
    },
    {
      key: 'paidPaisa',
      header: 'Collected',
      align: 'right',
      render: (inv) => (
        <span className="font-mono tabular-nums text-xs text-emerald-400">
          {formatCurrency(inv.paidPaisa)}
        </span>
      ),
    },
    {
      key: 'balancePaisa',
      header: 'Balance Due',
      align: 'right',
      render: (inv) => (
        <span className="font-mono font-bold tabular-nums text-xs text-[#FFC21A]">
          {formatCurrency(inv.balancePaisa)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => <span className="text-[#A5A5A5] text-xs">{formatDate(inv.dueDate)}</span>,
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
            {inv.daysOverdue}d overdue
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
            variant="primary"
            size="sm"
            onClick={() => navigate(`/payments/record?invoiceId=${inv.id}`)}
            className="text-xs px-2.5 py-1 h-auto"
          >
            <CreditCard className="w-3 h-3 mr-1" />
            <span>Collect</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/invoices/${inv.id}`)}
            className="text-xs px-2 py-1 h-auto text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#1E1E1E]"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
          Outstanding Balances & Aging
        </h1>
        <p className="text-xs text-[#A5A5A5] mt-0.5">
          Monitor uncollected membership fees and overdue balances categorized by delinquency aging
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#111111] border border-[#292929]">
          <span className="text-[10px] uppercase font-bold text-[#A5A5A5] tracking-wider block">
            Total Receivables
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-[#FFC21A] mt-1 block">
            {formatCurrency(report?.totalOutstandingPaisa || 0)}
          </span>
          <span className="text-[11px] text-[#737373] mt-1 block">
            Across {invoicesWithAging.length} open invoices
          </span>
        </div>

        <div className="p-5 rounded-xl bg-[#111111] border border-[#292929]">
          <span className="text-[10px] uppercase font-bold text-[#A5A5A5] tracking-wider block">
            Overdue Dues (Critical)
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-rose-400 mt-1 block">
            {invoicesWithAging.filter((i: any) => i.daysOverdue > 0).length}
          </span>
          <span className="text-[11px] text-[#737373] mt-1 block">Past scheduled due date</span>
        </div>

        <div className="p-5 rounded-xl bg-[#111111] border border-[#292929]">
          <span className="text-[10px] uppercase font-bold text-[#A5A5A5] tracking-wider block">
            Current (Within Terms)
          </span>
          <span className="text-2xl font-black font-mono tabular-nums text-emerald-400 mt-1 block">
            {invoicesWithAging.filter((i: any) => i.daysOverdue === 0).length}
          </span>
          <span className="text-[11px] text-[#737373] mt-1 block">Awaiting payment term</span>
        </div>
      </div>

      {/* Aging Category Filters */}
      <div className="flex flex-wrap gap-2">
        {agingBuckets.map((bucket) => (
          <button
            key={bucket.id}
            onClick={() => setSelectedAging(bucket.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
              selectedAging === bucket.id
                ? 'bg-[#FFC21A] border-[#FFC21A] text-[#080808] shadow-sm'
                : 'bg-[#111111] border-[#292929] text-[#A5A5A5] hover:text-[#F5F5F5] hover:border-[#3B3B3B]'
            }`}
          >
            <span>{bucket.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedAging === bucket.id
                  ? 'bg-[#080808]/20 text-[#080808]'
                  : 'bg-[#171717] text-[#D4D4D4]'
              }`}
            >
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
