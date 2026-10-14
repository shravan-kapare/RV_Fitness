import React, { useState } from 'react';
import { Calendar, Printer } from 'lucide-react';
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
  { id: 'collections', label: 'Collections by Method' },
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
          <h2 className="text-xl font-bold text-white tracking-tight">Financial Reports & Auditing</h2>
          <p className="text-xs text-gray-400">
            Real-time ledger analytics, collection breakdowns, and GST accounting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print Report
          </Button>
        </div>
      </div>

      <Card className="p-4 border-[#262626] bg-[#111] flex flex-wrap items-center gap-4 text-xs">
        <span className="text-gray-400 font-semibold flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Report Filter Window:</span>
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 px-2.5 rounded bg-[#161616] border border-[#333] text-white text-xs"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 px-2.5 rounded bg-[#161616] border border-[#333] text-white text-xs"
          />
        </div>
      </Card>

      <Tabs tabs={reportTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-[#262626]">
              <span className="text-xs text-gray-400 font-medium block">Gross Invoiced</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {formatCurrency(summary?.totalBilledPaisa || 0)}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Total membership receivables generated
              </span>
            </Card>

            <Card className="p-5 border-[#262626]">
              <span className="text-xs text-gray-400 font-medium block">Total Collections</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {formatCurrency(summary?.totalCollectedPaisa || 0)}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Settled via cash, UPI, & banks
              </span>
            </Card>

            <Card className="p-5 border-[#262626]">
              <span className="text-xs text-gray-400 font-medium block">Refunds & Reversals</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {formatCurrency(summary?.totalRefundedPaisa || 0)}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Processed refund adjustments
              </span>
            </Card>

            <Card className="p-5 border-[#262626]">
              <span className="text-xs text-gray-400 font-medium block">Net Realized Revenue</span>
              <span className="text-2xl font-black text-[#F59E0B] mt-1 block">
                {formatCurrency(summary?.netRevenuePaisa || 0)}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Collections minus disbursements
              </span>
            </Card>
          </div>

          <Card className="p-6 border-[#262626]">
            <h3 className="text-sm font-bold text-white mb-4">Operations Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#161616] border border-[#222]">
                <span className="text-gray-400 block mb-1">Invoices Issued</span>
                <span className="text-base font-bold text-white">{summary?.invoicesCount || 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#161616] border border-[#222]">
                <span className="text-gray-400 block mb-1">Payments Processed</span>
                <span className="text-base font-bold text-emerald-400">
                  {summary?.paymentsCount || 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#161616] border border-[#222]">
                <span className="text-gray-400 block mb-1">Refund Transactions</span>
                <span className="text-base font-bold text-rose-400">{summary?.refundsCount || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'collections' && (
        <Card className="p-6 border-[#262626]">
          <h3 className="text-sm font-bold text-white mb-4">Channel Performance & Totals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#262626] text-gray-400">
                  <th className="py-3 font-semibold">Payment Channel</th>
                  <th className="py-3 font-semibold text-center">Transactions</th>
                  <th className="py-3 font-semibold text-right">Collected Amount</th>
                  <th className="py-3 font-semibold text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {methodsList.map((c: any) => (
                  <tr key={c.method} className="text-gray-300">
                    <td className="py-3 font-semibold text-white">
                      {formatPaymentMethod(c.method)}
                    </td>
                    <td className="py-3 text-center">{c.count}</td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {formatCurrency(c.amountPaisa)}
                    </td>
                    <td className="py-3 text-right text-gray-400">{c.percentage || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'revenue' && (
        <Card className="p-6 border-[#262626]">
          <h3 className="text-sm font-bold text-white mb-4">Membership Package Yields</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#262626] text-gray-400">
                  <th className="py-3 font-semibold">Period / Plan</th>
                  <th className="py-3 font-semibold text-center">Invoices</th>
                  <th className="py-3 font-semibold text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {Array.isArray(revenueData) &&
                  revenueData.map((r: any, idx: number) => (
                    <tr key={r.planName || r.month || idx} className="text-gray-300">
                      <td className="py-3 font-semibold text-white">{r.planName || r.month || 'Standard Package'}</td>
                      <td className="py-3 text-center">{r.count || r.invoicesCount || 1}</td>
                      <td className="py-3 text-right font-bold text-white">
                        {formatCurrency(r.revenuePaisa || r.totalPaisa || 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
