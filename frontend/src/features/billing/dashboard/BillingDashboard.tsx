import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  PlusCircle,
  Clock,
  ArrowRight,
  Receipt as ReceiptIcon,
  Calendar,
  AlertTriangle,
  Scale,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';
import clsx from 'clsx';

export const BillingDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'month' | 'all'>('month');

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: invoiceRes, isLoading: invoicesLoading } = useInvoices({ page: 1, limit: 5 });
  const { data: paymentRes, isLoading: paymentsLoading } = usePayments({ page: 1, limit: 5 });

  const invoices = invoiceRes?.data || [];
  const payments = paymentRes?.data || [];

  if (statsLoading || invoicesLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalInvoiced = stats?.totalInvoicedPaisa || 0;
  const totalCollected = stats?.totalRevenuePaisa || 0;
  const totalOutstanding = stats?.totalOutstandingPaisa || stats?.outstandingPaisa || 0;
  const overdueCount = stats?.overdueCount || stats?.overdueInvoicesCount || 0;
  const overdueAmount = stats?.overdueAmountPaisa || 0;
  const todayCollections = stats?.todayCollectionsPaisa || 0;

  // Collection recovery percentage
  const collectionRate = totalInvoiced > 0
    ? Math.min(100, Math.round((totalCollected / totalInvoiced) * 100))
    : 0;

  // Channel breakdown
  const channelData = stats?.collectionsByMethod || [];
  const totalChannelAmount = channelData.reduce((acc, curr) => acc + curr.amountPaisa, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Action & Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] p-4 rounded-xl border border-[#292929]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">
            Billing Operations
          </h2>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Narsobawadi Center • Verified Ledger & Cash Register
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Period Selector Tabs */}
          <div className="inline-flex items-center p-1 rounded-lg bg-[#171717] border border-[#292929] text-xs">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={clsx(
                'px-2.5 py-1 rounded font-medium transition-colors cursor-pointer',
                selectedPeriod === 'today'
                  ? 'bg-[#262626] text-[#F5F5F5]'
                  : 'text-[#A5A5A5] hover:text-[#F5F5F5]'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={clsx(
                'px-2.5 py-1 rounded font-medium transition-colors cursor-pointer',
                selectedPeriod === 'month'
                  ? 'bg-[#262626] text-[#F5F5F5]'
                  : 'text-[#A5A5A5] hover:text-[#F5F5F5]'
              )}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={clsx(
                'px-2.5 py-1 rounded font-medium transition-colors cursor-pointer',
                selectedPeriod === 'all'
                  ? 'bg-[#262626] text-[#F5F5F5]'
                  : 'text-[#A5A5A5] hover:text-[#F5F5F5]'
              )}
            >
              All Time
            </button>
          </div>

          {/* Quick Action Buttons */}
          <Link to="/payments/record">
            <Button variant="primary" size="sm">
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              <span>Record Payment</span>
            </Button>
          </Link>
          <Link to="/invoices/create">
            <Button variant="secondary" size="sm">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              <span>New Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Attention Banner (If Overdue or Shift Closing pending) */}
      {overdueCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FFC21A] shrink-0" />
            <span>
              <strong>Attention Required:</strong> {overdueCount} invoice{overdueCount > 1 ? 's are' : ' is'} past due date, totaling{' '}
              <strong className="text-[#F5F5F5]">{formatCurrency(overdueAmount)}</strong> in pending receivables.
            </span>
          </div>
          <Link
            to="/outstanding"
            className="text-xs font-semibold text-[#FFC21A] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Review Aging Brackets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Financial Summary: Composed Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Primary Collections Box (Hero Metric) */}
        <div className="rounded-xl p-5 bg-[#111111] border border-[#292929] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFC21A]" />
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#A5A5A5]">
              <span>Recorded Collections (Revenue)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-semibold">
                Settled
              </span>
            </div>
            <div className="text-3xl font-black text-[#F5F5F5] tracking-tight mt-2 tabular-nums">
              {formatCurrency(totalCollected)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Confirmed cash and verified digital deposits in ledger
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#222222] flex items-center justify-between text-xs">
            <span className="text-[#A5A5A5] flex items-center gap-1.5">
              <ReceiptIcon className="w-3.5 h-3.5 text-[#FFC21A]" />
              Today's Shift:
            </span>
            <span className="font-bold text-[#F5F5F5] tabular-nums">
              {formatCurrency(todayCollections)}
            </span>
          </div>
        </div>

        {/* Outstanding Receivables Box */}
        <div className="rounded-xl p-5 bg-[#111111] border border-[#292929] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#A5A5A5]">
              <span>Outstanding Receivables</span>
              <span className={clsx(
                'text-[10px] px-2 py-0.5 rounded-full font-semibold border',
                overdueCount > 0
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                  : 'bg-[#181818] text-[#A5A5A5] border-[#292929]'
              )}>
                {overdueCount} Overdue
              </span>
            </div>
            <div className="text-3xl font-bold text-[#F5F5F5] tracking-tight mt-2 tabular-nums">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Active balances awaiting member payments
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#222222] flex items-center justify-between text-xs">
            <span className="text-[#A5A5A5] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Past Due Amount:
            </span>
            <span className="font-semibold text-rose-400 tabular-nums">
              {formatCurrency(overdueAmount)}
            </span>
          </div>
        </div>

        {/* Total Invoiced & Recovery Health */}
        <div className="rounded-xl p-5 bg-[#111111] border border-[#292929] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#A5A5A5]">
              <span>Invoiced Volume & Recovery</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181818] text-[#A5A5A5] border border-[#292929] font-semibold tabular-nums">
                {collectionRate}% Realized
              </span>
            </div>
            <div className="text-3xl font-bold text-[#F5F5F5] tracking-tight mt-2 tabular-nums">
              {formatCurrency(totalInvoiced)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Gross membership subscriptions & items invoiced
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 pt-3.5 border-t border-[#222222] space-y-1.5">
            <div className="w-full bg-[#1A1A1A] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#FFC21A] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#737373]">
              <span>Collections vs Invoiced</span>
              <span className="font-semibold text-[#A5A5A5]">{collectionRate}% Recovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Financial Visualization: Payment Channels & Shift Settlement */}
      <div className="rounded-xl bg-[#111111] border border-[#292929] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#222222] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
              Payment Channel Allocation & Shift Register
            </h3>
            <p className="text-xs text-[#A5A5A5]">
              Audited breakdown of confirmed collections across gym payment methods
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/daily-closing">
              <Button variant="ghost" size="sm" className="text-xs">
                <CalendarCheck className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
                <span>Shift Closing</span>
              </Button>
            </Link>
            <Link to="/reconciliation">
              <Button variant="ghost" size="sm" className="text-xs">
                <Scale className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
                <span>Reconciliation</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Channel Breakdown */}
        {channelData.length > 0 ? (
          <div className="space-y-4 pt-1">
            {/* Visual Distribution Bar */}
            <div className="w-full h-3 rounded-full bg-[#181818] overflow-hidden flex">
              {channelData.map((item, idx) => {
                const percentage = totalChannelAmount > 0
                  ? (item.amountPaisa / totalChannelAmount) * 100
                  : 0;
                const colors = ['bg-[#FFC21A]', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-zinc-500'];
                const color = colors[idx % colors.length];

                return (
                  <div
                    key={item.method}
                    style={{ width: `${percentage}%` }}
                    className={clsx('h-full transition-all duration-300', color)}
                    title={`${formatPaymentMethod(item.method)}: ${percentage.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Channel Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {channelData.map((channel, idx) => {
                const colors = ['border-[#FFC21A]/30 text-[#FFC21A]', 'border-emerald-500/30 text-emerald-400', 'border-sky-500/30 text-sky-400', 'border-violet-500/30 text-violet-400'];
                const accent = colors[idx % colors.length];

                return (
                  <div key={channel.method} className="p-3 rounded-lg bg-[#151515] border border-[#222222]">
                    <div className="flex items-center justify-between text-[11px] text-[#A5A5A5]">
                      <span>{formatPaymentMethod(channel.method)}</span>
                      <span className="text-[10px] tabular-nums font-semibold text-[#737373]">{channel.count} txns</span>
                    </div>
                    <div className="text-base font-bold text-[#F5F5F5] mt-1 tabular-nums">
                      {formatCurrency(channel.amountPaisa)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-[#737373]">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#383838] mb-2" />
            <p className="text-xs text-[#A5A5A5] font-medium">No channel breakdown recorded for this period yet</p>
            <p className="text-[11px] text-[#737373] mt-0.5">Recorded cash desk or digital payments will visualize here</p>
          </div>
        )}
      </div>

      {/* Operational Workspace: Two Column Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Table */}
        <div className="rounded-xl bg-[#111111] border border-[#292929] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#222222]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F5F5]">Recent Invoices</h3>
                <p className="text-[11px] text-[#A5A5A5]">Latest member subscriptions generated</p>
              </div>
              <Link
                to="/invoices"
                className="text-xs text-[#FFC21A] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All Invoices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {invoices.length === 0 ? (
                <div className="py-10 text-center text-[#737373]">
                  <p className="text-xs text-[#A5A5A5]">No invoices found</p>
                  <Link to="/invoices/create" className="text-xs text-[#FFC21A] hover:underline mt-1 inline-block">
                    Create first invoice
                  </Link>
                </div>
              ) : (
                invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    to={`/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#151515] hover:bg-[#1A1A1A] transition-colors border border-[#222222] group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#F5F5F5] group-hover:text-[#FFC21A] transition-colors">
                          {inv.invoiceNumber}
                        </span>
                        <StatusBadge status={inv.status} type="invoice" size="sm" />
                      </div>
                      <p className="text-[11px] text-[#A5A5A5] mt-1 truncate">
                        {inv.member?.user?.fullName || 'Gym Member'} • Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#F5F5F5] tabular-nums">
                        {formatCurrency(inv.totalPaisa)}
                      </p>
                      <p className="text-[10px] text-[#737373] tabular-nums">
                        Paid: {formatCurrency(inv.paidPaisa)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Confirmed Payments Table */}
        <div className="rounded-xl bg-[#111111] border border-[#292929] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#222222]">
              <div>
                <h3 className="text-sm font-bold text-[#F5F5F5]">Recent Payments</h3>
                <p className="text-[11px] text-[#A5A5A5]">Audited transaction entries in ledger</p>
              </div>
              <Link
                to="/payments"
                className="text-xs text-[#FFC21A] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>All Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {payments.length === 0 ? (
                <div className="py-10 text-center text-[#737373]">
                  <p className="text-xs text-[#A5A5A5]">No payment transactions recorded</p>
                  <Link to="/payments/record" className="text-xs text-[#FFC21A] hover:underline mt-1 inline-block">
                    Record a payment
                  </Link>
                </div>
              ) : (
                payments.map((pmt) => (
                  <Link
                    key={pmt.id}
                    to={`/payments/${pmt.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#151515] hover:bg-[#1A1A1A] transition-colors border border-[#222222] group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#F5F5F5] group-hover:text-[#FFC21A] transition-colors">
                          {pmt.paymentNumber}
                        </span>
                        <StatusBadge status={pmt.status} type="payment" size="sm" />
                      </div>
                      <p className="text-[11px] text-[#A5A5A5] mt-1 truncate">
                        {formatPaymentMethod(pmt.method)} • {formatDate(pmt.paymentDate)}
                        {pmt.referenceNumber ? ` • Ref: ${pmt.referenceNumber}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-400 tabular-nums">
                        +{formatCurrency(pmt.amountPaisa)}
                      </p>
                      <span className="text-[10px] text-[#737373]">
                        {pmt.invoice?.invoiceNumber || 'Invoice'}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
