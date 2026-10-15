import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
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
  QrCode,
  UserCheck,
  Package,
  Activity,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { useMembers } from '@/hooks/useMembers';
import { useMemberships, useExpiringMemberships } from '@/hooks/useMemberships';
import { useDailyAttendance } from '@/hooks/useAttendance';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';
import clsx from 'clsx';

export const BillingDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'month' | 'all'>('month');

  // Queries
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: membersRes, isLoading: membersLoading } = useMembers({ limit: 100 });
  const { data: memberships = [], isLoading: membershipsLoading } = useMemberships();
  const { data: expiringMemberships = [] } = useExpiringMemberships(14);
  const { data: attendanceData, isLoading: attendanceLoading } = useDailyAttendance();
  const { data: invoiceRes, isLoading: invoicesLoading } = useInvoices({ page: 1, limit: 5 });
  const { data: paymentRes, isLoading: paymentsLoading } = usePayments({ page: 1, limit: 5 });

  const members = membersRes?.data || [];
  const activeMembers = members.filter((m) => m.isActive).length;
  const activeMemberships = memberships.filter((m: any) => m.status === 'ACTIVE').length;
  const todayVisits = attendanceData?.records?.length || 0;
  const todayCollections = stats?.todayCollectionsPaisa || 0;

  const invoices = invoiceRes?.data || [];
  const payments = paymentRes?.data || [];

  const totalInvoiced = stats?.totalInvoicedPaisa || 0;
  const totalCollected = stats?.totalRevenuePaisa || 0;
  const totalOutstanding = stats?.totalOutstandingPaisa || stats?.outstandingPaisa || 0;
  const overdueCount = stats?.overdueCount || stats?.overdueInvoicesCount || 0;
  const overdueAmount = stats?.overdueAmountPaisa || 0;

  // Collection recovery percentage
  const collectionRate =
    totalInvoiced > 0 ? Math.min(100, Math.round((totalCollected / totalInvoiced) * 100)) : 0;

  // Channel breakdown
  const channelData = stats?.collectionsByMethod || [];
  const totalChannelAmount = channelData.reduce((acc, curr) => acc + curr.amountPaisa, 0);

  const isLoading = statsLoading || invoicesLoading || paymentsLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Attention conditions
  const hasAttentionItems = overdueCount > 0 || expiringMemberships.length > 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* 1. TOP BAR & QUICK ACTIONS TOOLBAR */}
      <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#FFC21A] bg-[#1A1A22] border border-white/10 px-2 py-0.5 rounded uppercase">
              Operational Command
            </span>
            <span className="text-xs text-[#71717A]">|</span>
            <span className="text-xs font-mono text-[#A1A1AA]">Narsobawadi Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Gym Management Overview
          </h1>
        </div>

        {/* Compact Quick Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/members">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              <Users className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
              <span>Register Member</span>
            </Button>
          </Link>
          <Link to="/admin/attendance">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
              <span>Turnstile Desk</span>
            </Button>
          </Link>
          <Link to="/invoices/create">
            <Button variant="secondary" size="sm" className="text-xs font-semibold">
              <PlusCircle className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
              <span>New Invoice</span>
            </Button>
          </Link>
          <Link to="/payments/record">
            <Button variant="primary" size="sm" className="text-xs font-bold uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 mr-1" />
              <span>Record Payment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. PRIMARY OVERVIEW: 4 COMPACT, UNIFORMLY SIZED METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Active Members */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:border-white/20 transition">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Active Members</span>
            <Users className="w-4 h-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {activeMembers}
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">
              Total enrolled: {members.length}
            </p>
          </div>
        </div>

        {/* Metric 2: Active Memberships */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:border-white/20 transition">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Active Contracts</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              {activeMemberships}
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">
              Subscriptions on floor
            </p>
          </div>
        </div>

        {/* Metric 3: Today's Turnstile Check-ins */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:border-white/20 transition">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Today's Visits</span>
            <QrCode className="w-4 h-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {todayVisits}
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">
              Turnstile logs today
            </p>
          </div>
        </div>

        {/* Metric 4: Today's Shift Collections */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md hover:border-white/20 transition">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Today's Cash Flow</span>
            <ReceiptIcon className="w-4 h-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#FFC21A] tabular-nums">
              {formatCurrency(todayCollections)}
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">
              Audited front desk shift
            </p>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL ATTENTION BAR (Only shown when action is needed) */}
      {hasAttentionItems && (
        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#FFC21A]" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider text-amber-300 block">
                Operational Tasks Requiring Attention
              </span>
              <p className="text-[#D4D4D8]">
                {overdueCount > 0 && (
                  <span className="mr-3">
                    • <strong>{overdueCount}</strong> overdue invoice{overdueCount > 1 ? 's' : ''} ({formatCurrency(overdueAmount)})
                  </span>
                )}
                {expiringMemberships.length > 0 && (
                  <span>
                    • <strong>{expiringMemberships.length}</strong> subscription{expiringMemberships.length > 1 ? 's' : ''} expiring within 14 days
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {overdueCount > 0 && (
              <Link
                to="/outstanding"
                className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1A1A22] border border-white/10 text-xs font-bold text-[#FFC21A] transition"
              >
                Review Dues
              </Link>
            )}
            {expiringMemberships.length > 0 && (
              <Link
                to="/admin/memberships"
                className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1A1A22] border border-white/10 text-xs font-bold text-white transition"
              >
                Review Renewals
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 4. FINANCIAL SUMMARY CARDS: DE-CONGESTED, RESTRAINED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Collected */}
        <div className="bg-[#141418] p-5 rounded-2xl border border-white/10 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Net Collected Revenue</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              SETTLED
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(totalCollected)}
          </div>
          <p className="text-[11px] text-[#71717A]">
            Cumulative deposits verified in ledger
          </p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-[#141418] p-5 rounded-2xl border border-white/10 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Outstanding Balance</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
              PENDING
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-[11px] text-[#71717A]">
            Active receivables across member invoices
          </p>
        </div>

        {/* Invoiced Volume & Recovery Index */}
        <div className="bg-[#141418] p-5 rounded-2xl border border-white/10 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Invoiced Volume</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A22] text-[#FFC21A] font-bold border border-white/10">
              {collectionRate}% Realized
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(totalInvoiced)}
          </div>
          <div className="w-full bg-[#101014] rounded-full h-1.5 overflow-hidden border border-white/5 mt-1">
            <div
              className="bg-[#FFC21A] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. CHANNEL SETTLEMENT BREAKDOWN */}
      <div className="bg-[#141418] p-5 rounded-2xl border border-white/10 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FFC21A]" />
              <span>Shift Register & Influx by Payment Channel</span>
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Breakdown of collections verified through Cash, UPI, Card, and Bank deposits
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

        {channelData.length > 0 ? (
          <div className="space-y-3">
            {/* Distribution Bar */}
            <div className="w-full h-2 rounded-full bg-[#101014] overflow-hidden flex border border-white/5">
              {channelData.map((item, idx) => {
                const percentage =
                  totalChannelAmount > 0 ? (item.amountPaisa / totalChannelAmount) * 100 : 0;
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

            {/* Compact Channel Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {channelData.map((channel) => (
                <div key={channel.method} className="p-3 rounded-xl bg-[#101014] border border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                    <span className="font-semibold">{formatPaymentMethod(channel.method)}</span>
                    <span className="font-mono text-[#71717A] text-[10px]">{channel.count} txns</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-white mt-1 tabular-nums">
                    {formatCurrency(channel.amountPaisa)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-[#71717A] text-xs">
            No payments recorded yet for this session. Use "Record Payment" to log drawer deposits.
          </div>
        )}
      </div>

      {/* 6. OPERATIONAL TABLES: RECENT INVOICES & PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <div className="bg-[#141418] p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Recent Invoices</h3>
                <p className="text-[11px] text-[#A1A1AA]">Latest membership billings generated</p>
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
                <div className="py-8 text-center text-[#71717A] text-xs">
                  <p>No invoices found.</p>
                  <Link to="/invoices/create" className="text-[#FFC21A] hover:underline mt-1 inline-block">
                    Create first invoice
                  </Link>
                </div>
              ) : (
                invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    to={`/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#101014] hover:bg-[#1A1A22] transition-colors border border-white/5 hover:border-[#FFC21A]/30 group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white group-hover:text-[#FFC21A] transition-colors">
                          {inv.invoiceNumber}
                        </span>
                        <StatusBadge status={inv.status} type="invoice" size="sm" />
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5 truncate">
                        {inv.member?.user?.fullName || 'Gym Member'} • Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-white font-mono tabular-nums">
                        {formatCurrency(inv.totalPaisa)}
                      </p>
                      <p className="text-[10px] text-[#71717A] font-mono tabular-nums">
                        Paid: {formatCurrency(inv.paidPaisa)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Confirmed Payments */}
        <div className="bg-[#141418] p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Recent Payments</h3>
                <p className="text-[11px] text-[#A1A1AA]">Audited entries in ledger</p>
              </div>
              <Link
                to="/payments"
                className="text-xs text-[#FFC21A] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>All Payments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {payments.length === 0 ? (
                <div className="py-8 text-center text-[#71717A] text-xs">
                  <p>No payment transactions recorded.</p>
                  <Link to="/payments/record" className="text-[#FFC21A] hover:underline mt-1 inline-block">
                    Record a payment
                  </Link>
                </div>
              ) : (
                payments.map((pmt) => (
                  <Link
                    key={pmt.id}
                    to={`/payments/${pmt.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#101014] hover:bg-[#1A1A22] transition-colors border border-white/5 hover:border-[#FFC21A]/30 group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white group-hover:text-[#FFC21A] transition-colors">
                          {pmt.paymentNumber}
                        </span>
                        <StatusBadge status={pmt.status} type="payment" size="sm" />
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5 truncate">
                        {formatPaymentMethod(pmt.method)} • {formatDate(pmt.paymentDate)}
                        {pmt.referenceNumber ? ` • Ref: ${pmt.referenceNumber}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                        +{formatCurrency(pmt.amountPaisa)}
                      </p>
                      <span className="text-[10px] text-[#71717A] font-mono">
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
