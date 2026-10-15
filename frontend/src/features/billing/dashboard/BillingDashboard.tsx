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
  CheckCircle2,
  TrendingUp,
  Sparkles,
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
  const collectionRate =
    totalInvoiced > 0 ? Math.min(100, Math.round((totalCollected / totalInvoiced) * 100)) : 0;

  // Channel breakdown
  const channelData = stats?.collectionsByMethod || [];
  const totalChannelAmount = channelData.reduce((acc, curr) => acc + curr.amountPaisa, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Action & Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141418] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#1A1A22] border border-white/10 text-[11px] font-mono font-bold text-[#FFC21A] mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>FINANCIAL OPERATIONS ENGINE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Revenue & Billing Desk
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Narsobawadi Center • Verified Ledger, Subscriptions & Daily Collections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Period Selector Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#101014] border border-white/10 text-xs font-mono">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-bold uppercase transition-all duration-150 cursor-pointer text-[11px]',
                selectedPeriod === 'today'
                  ? 'bg-[#1C1C24] text-[#FFC21A] border border-white/10 shadow'
                  : 'text-[#A5A5A5] hover:text-white'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-bold uppercase transition-all duration-150 cursor-pointer text-[11px]',
                selectedPeriod === 'month'
                  ? 'bg-[#1C1C24] text-[#FFC21A] border border-white/10 shadow'
                  : 'text-[#A5A5A5] hover:text-white'
              )}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-bold uppercase transition-all duration-150 cursor-pointer text-[11px]',
                selectedPeriod === 'all'
                  ? 'bg-[#1C1C24] text-[#FFC21A] border border-white/10 shadow'
                  : 'text-[#A5A5A5] hover:text-white'
              )}
            >
              All Time
            </button>
          </div>

          {/* Quick Action Buttons */}
          <Link to="/payments/record">
            <Button variant="primary" size="sm" className="font-bold text-xs uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              <span>Record Payment</span>
            </Button>
          </Link>
          <Link to="/invoices/create">
            <Button variant="secondary" size="sm" className="font-bold text-xs uppercase tracking-wider">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-[#FFC21A]" />
              <span>New Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Attention Banner (If Overdue or Shift Closing pending) */}
      {overdueCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#FFC21A]" />
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider block text-amber-300">
                Action Required — Pending Receivables
              </span>
              <span className="text-[#CCCCCC]">
                {overdueCount} subscription invoice{overdueCount > 1 ? 's are' : ' is'} overdue, totaling{' '}
                <strong className="text-white font-mono">{formatCurrency(overdueAmount)}</strong>.
              </span>
            </div>
          </div>
          <Link
            to="/outstanding"
            className="text-xs font-bold uppercase text-[#FFC21A] hover:underline flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-lg bg-[#141418] border border-white/10"
          >
            <span>Inspect Aging Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Financial Summary: Composed Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Primary Collections Box (Hero Metric) */}
        <div className="rounded-2xl p-6 bg-[#141418] border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFC21A]" />
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5A5A5]">
              <span>Realized Revenue</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                AUDITED
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3 tabular-nums font-mono">
              {formatCurrency(totalCollected)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Confirmed cash & verified digital settlements
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#A5A5A5] flex items-center gap-1.5">
              <ReceiptIcon className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span>Today's Shift:</span>
            </span>
            <span className="font-bold text-white font-mono tabular-nums text-sm">
              {formatCurrency(todayCollections)}
            </span>
          </div>
        </div>

        {/* Outstanding Receivables Box */}
        <div className="rounded-2xl p-6 bg-[#141418] border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5A5A5]">
              <span>Outstanding Balances</span>
              <span
                className={clsx(
                  'text-[10px] px-2.5 py-0.5 rounded-full font-bold border',
                  overdueCount > 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-[#1A1A22] text-[#A5A5A5] border-white/10'
                )}
              >
                {overdueCount} Overdue
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3 tabular-nums font-mono">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Pending admission dues & payment allocations
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#A5A5A5] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Past Due Dues:</span>
            </span>
            <span className="font-bold text-rose-400 font-mono tabular-nums text-sm">
              {formatCurrency(overdueAmount)}
            </span>
          </div>
        </div>

        {/* Total Invoiced & Recovery Health */}
        <div className="rounded-2xl p-6 bg-[#141418] border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5A5A5]">
              <span>Gross Invoiced Volume</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1A1A22] text-[#FFC21A] border border-white/10 font-bold tabular-nums">
                {collectionRate}% Realized
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3 tabular-nums font-mono">
              {formatCurrency(totalInvoiced)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Cumulative contract billings issued to date
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <div className="w-full bg-[#101014] rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-[#FFC21A] h-2 rounded-full transition-all duration-500 shadow-sm shadow-[#FFC21A]/50"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#737373]">
              <span>Settlement vs Billed</span>
              <span className="font-bold text-[#A5A5A5]">{collectionRate}% Recovery Index</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Financial Visualization: Payment Channels & Shift Settlement */}
      <div className="rounded-2xl bg-[#141418] border border-white/10 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#FFC21A]" />
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                Collection Influx by Channel & Desk Settlement
              </h2>
            </div>
            <p className="text-xs text-[#A5A5A5] mt-0.5">
              Audited breakdown of confirmed collections across cash, UPI, card, and bank transfers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/daily-closing">
              <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider">
                <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-[#FFC21A]" />
                <span>Shift Closing</span>
              </Button>
            </Link>
            <Link to="/reconciliation">
              <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 mr-1.5 text-[#FFC21A]" />
                <span>Audit Reconciliation</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Channel Breakdown */}
        {channelData.length > 0 ? (
          <div className="space-y-4 pt-1">
            {/* Visual Distribution Bar */}
            <div className="w-full h-3 rounded-full bg-[#101014] overflow-hidden flex border border-white/5">
              {channelData.map((item, idx) => {
                const percentage =
                  totalChannelAmount > 0 ? (item.amountPaisa / totalChannelAmount) * 100 : 0;
                const colors = [
                  'bg-[#FFC21A]',
                  'bg-emerald-500',
                  'bg-sky-500',
                  'bg-violet-500',
                  'bg-zinc-500',
                ];
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
                return (
                  <div
                    key={channel.method}
                    className="p-4 rounded-xl bg-[#101014] border border-white/10 hover:border-[#FFC21A]/30 transition"
                  >
                    <div className="flex items-center justify-between text-xs text-[#A5A5A5]">
                      <span className="font-bold text-white uppercase text-[11px]">
                        {formatPaymentMethod(channel.method)}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-[#737373]">
                        {channel.count} txns
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-white mt-1.5 tabular-nums font-mono">
                      {formatCurrency(channel.amountPaisa)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-[#737373]">
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#383838] mb-2" />
            <p className="text-xs text-[#A5A5A5] font-bold uppercase tracking-wider">
              No Transactions Recorded in this Period
            </p>
            <p className="text-[11px] text-[#737373] mt-1">
              Recorded front desk payments will automatically chart here.
            </p>
          </div>
        )}
      </div>

      {/* Operational Workspace: Two Column Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Table */}
        <div className="rounded-2xl bg-[#141418] border border-white/10 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Recent Invoices</h3>
                <p className="text-[11px] text-[#A5A5A5]">Latest member subscriptions generated</p>
              </div>
              <Link
                to="/invoices"
                className="text-xs text-[#FFC21A] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                <span>View All Invoices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {invoices.length === 0 ? (
                <div className="py-12 text-center text-[#737373]">
                  <p className="text-xs text-[#A5A5A5]">No invoices found</p>
                  <Link
                    to="/invoices/create"
                    className="text-xs text-[#FFC21A] hover:underline mt-1 inline-block font-bold"
                  >
                    Create first invoice
                  </Link>
                </div>
              ) : (
                invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    to={`/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#101014] hover:bg-[#1A1A22] transition-colors border border-white/5 hover:border-[#FFC21A]/30 group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white group-hover:text-[#FFC21A] transition-colors">
                          {inv.invoiceNumber}
                        </span>
                        <StatusBadge status={inv.status} type="invoice" size="sm" />
                      </div>
                      <p className="text-[11px] text-[#A5A5A5] mt-1 truncate">
                        {inv.member?.user?.fullName || 'Gym Member'} • Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-white font-mono tabular-nums">
                        {formatCurrency(inv.totalPaisa)}
                      </p>
                      <p className="text-[10px] text-[#737373] font-mono tabular-nums">
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
        <div className="rounded-2xl bg-[#141418] border border-white/10 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Recent Payments</h3>
                <p className="text-[11px] text-[#A5A5A5]">Audited transaction entries in ledger</p>
              </div>
              <Link
                to="/payments"
                className="text-xs text-[#FFC21A] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                <span>All Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {payments.length === 0 ? (
                <div className="py-12 text-center text-[#737373]">
                  <p className="text-xs text-[#A5A5A5]">No payment transactions recorded</p>
                  <Link
                    to="/payments/record"
                    className="text-xs text-[#FFC21A] hover:underline mt-1 inline-block font-bold"
                  >
                    Record a payment
                  </Link>
                </div>
              ) : (
                payments.map((pmt) => (
                  <Link
                    key={pmt.id}
                    to={`/payments/${pmt.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#101014] hover:bg-[#1A1A22] transition-colors border border-white/5 hover:border-[#FFC21A]/30 group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white group-hover:text-[#FFC21A] transition-colors">
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
                      <p className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                        +{formatCurrency(pmt.amountPaisa)}
                      </p>
                      <span className="text-[10px] text-[#737373] font-mono">
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
