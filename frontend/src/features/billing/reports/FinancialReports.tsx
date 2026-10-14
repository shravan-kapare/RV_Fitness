import React, { useState } from 'react';
import { Calendar, Printer, TrendingUp, DollarSign, ArrowUpRight, BarChart3 } from 'lucide-react';
import {
  useSummaryReport,
  useCollectionsReport,
  useOutstandingReport,
  useRevenueReport,
} from '@/hooks/useReports';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { formatCurrency, formatPaymentMethod } from '@/lib/formatters';

const reportTabs = [
  { id: 'summary', label: 'Financial Summary' },
  { id: 'collections', label: 'Collections by Channel' },
  { id: 'revenue', label: 'Revenue by Plan' },
];

export const FinancialReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: summary } = useSummaryReport(
    new Date(startDate).toISOString(),
    new Date(endDate).toISOString()
  );

  const { data: collectionsReport } = useCollectionsReport(
    new Date(startDate).toISOString(),
    new Date(endDate).toISOString()
  );

  const { data: revenueData = [] } = useRevenueReport('month');

  const methodsList = collectionsReport?.methods || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
            Financial Reports & Accounting
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Real-time ledger analytics, channel performance, and GST revenue accounting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5 mr-1.5 text-[#FFC21A]" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="p-3.5 rounded-xl bg-[#111111] border border-[#292929] flex flex-wrap items-center gap-4 text-xs">
        <span className="text-[#A5A5A5] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#FFC21A]" />
          <span>Accounting Period:</span>
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 px-2.5 rounded bg-[#171717] border border-[#292929] text-[#F5F5F5] text-xs focus:border-[#FFC21A] focus:outline-none"
          />
          <span className="text-[#737373]">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 px-2.5 rounded bg-[#171717] border border-[#292929] text-[#F5F5F5] text-xs focus:border-[#FFC21A] focus:outline-none"
          />
        </div>
      </div>

      <Tabs tabs={reportTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#111111] border border-[#292929]">
              <span className="text-[10px] text-[#A5A5A5] font-bold uppercase tracking-wider block">
                Gross Invoiced
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-[#F5F5F5] mt-1 block">
                {formatCurrency(summary?.totalBilledPaisa || 0)}
              </span>
              <span className="text-[11px] text-[#737373] mt-1 block">
                Total membership dues generated
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#111111] border border-[#292929]">
              <span className="text-[10px] text-[#A5A5A5] font-bold uppercase tracking-wider block">
                Total Collections
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-emerald-400 mt-1 block">
                {formatCurrency(summary?.totalCollectedPaisa || 0)}
              </span>
              <span className="text-[11px] text-[#737373] mt-1 block">
                Settled via cash, UPI, & card
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#111111] border border-[#292929]">
              <span className="text-[10px] text-[#A5A5A5] font-bold uppercase tracking-wider block">
                Refunds & Reversals
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-rose-400 mt-1 block">
                {formatCurrency(summary?.totalRefundedPaisa || 0)}
              </span>
              <span className="text-[11px] text-[#737373] mt-1 block">
                Approved refund disbursements
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#111111] border border-[#292929]">
              <span className="text-[10px] text-[#A5A5A5] font-bold uppercase tracking-wider block">
                Net Realized Yield
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-[#FFC21A] mt-1 block">
                {formatCurrency(summary?.netRevenuePaisa || 0)}
              </span>
              <span className="text-[11px] text-[#737373] mt-1 block">
                Net cash inflow to RV Fitness
              </span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#111111] border border-[#292929]">
            <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-4">
              Operational Volumes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#171717] border border-[#292929]">
                <span className="text-[10px] uppercase font-bold text-[#A5A5A5] block mb-1">Invoices Created</span>
                <span className="text-xl font-bold font-mono text-[#F5F5F5]">{summary?.invoicesCount || 0}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#171717] border border-[#292929]">
                <span className="text-[10px] uppercase font-bold text-[#A5A5A5] block mb-1">Receipts Settled</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {summary?.paymentsCount || 0}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-[#171717] border border-[#292929]">
                <span className="text-[10px] uppercase font-bold text-[#A5A5A5] block mb-1">Refund Transactions</span>
                <span className="text-xl font-bold font-mono text-rose-400">{summary?.refundsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="p-6 rounded-xl bg-[#111111] border border-[#292929]">
          <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-4">
            Payment Channel Distribution
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[#A5A5A5] uppercase tracking-wider text-[11px]">
                  <th className="py-3 font-semibold">Payment Channel</th>
                  <th className="py-3 font-semibold text-center">Transactions</th>
                  <th className="py-3 font-semibold text-right">Collected Amount</th>
                  <th className="py-3 font-semibold text-right">Channel Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {methodsList.map((c: any) => (
                  <tr key={c.method} className="text-[#D4D4D4] hover:bg-[#171717]/40">
                    <td className="py-3 font-semibold text-[#F5F5F5]">
                      {formatPaymentMethod(c.method)}
                    </td>
                    <td className="py-3 text-center font-mono">{c.count}</td>
                    <td className="py-3 text-right font-mono font-bold tabular-nums text-emerald-400">
                      {formatCurrency(c.amountPaisa)}
                    </td>
                    <td className="py-3 text-right font-mono text-[#A5A5A5]">{c.percentage || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="p-6 rounded-xl bg-[#111111] border border-[#292929]">
          <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-4">
            Membership Plan Yields
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[#A5A5A5] uppercase tracking-wider text-[11px]">
                  <th className="py-3 font-semibold">Membership Plan / Period</th>
                  <th className="py-3 font-semibold text-center">Invoices</th>
                  <th className="py-3 font-semibold text-right">Gross Realized Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {Array.isArray(revenueData) &&
                  revenueData.map((r: any, idx: number) => (
                    <tr key={r.planName || r.month || idx} className="text-[#D4D4D4] hover:bg-[#171717]/40">
                      <td className="py-3 font-semibold text-[#F5F5F5]">{r.planName || r.month || 'General Plan'}</td>
                      <td className="py-3 text-center font-mono">{r.count || r.invoicesCount || 1}</td>
                      <td className="py-3 text-right font-mono font-bold tabular-nums text-[#F5F5F5]">
                        {formatCurrency(r.revenuePaisa || r.totalPaisa || 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
