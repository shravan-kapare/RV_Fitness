import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertCircle,
  FileText,
  CreditCard,
  PlusCircle,
  Receipt as ReceiptIcon,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';

export const BillingDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: invoiceRes, isLoading: invoicesLoading } = useInvoices({ page: 1, limit: 5 });
  const { data: paymentRes, isLoading: paymentsLoading } = usePayments({ page: 1, limit: 5 });

  const invoices = invoiceRes?.data || [];
  const payments = paymentRes?.data || [];

  if (statsLoading || invoicesLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] p-4 rounded-xl border border-[#262626]">
        <div>
          <h2 className="text-base font-bold text-white">Financial Snapshot</h2>
          <p className="text-xs text-gray-400">Real-time collections and revenue ledger overview</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/invoices/create" className="flex-1 sm:flex-initial">
            <Button variant="secondary" size="sm" className="w-full">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>New Invoice</span>
            </Button>
          </Link>
          <Link to="/payments/record" className="flex-1 sm:flex-initial">
            <Button variant="primary" size="sm" className="w-full">
              <CreditCard className="w-4 h-4 mr-1.5" />
              <span>Record Payment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue Realized"
          value={formatCurrency(stats?.totalRevenuePaisa || 0)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          description="Net collections settled"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(stats?.outstandingPaisa || 0)}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          description="Pending receivables"
        />
        <StatCard
          title="Overdue Invoices"
          value={String(stats?.overdueInvoicesCount || 0)}
          icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
          description="Invoices past due date"
        />
        <StatCard
          title="Today's Collections"
          value={formatCurrency(stats?.todayCollectionsPaisa || 0)}
          icon={<ReceiptIcon className="w-5 h-5 text-[#F59E0B]" />}
          description="Logged during today's shift"
        />
      </div>

      {/* Secondary Metrics / Quick Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 border-[#262626]">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
            <span>Shift Register Status</span>
            <ReceiptIcon className="w-4 h-4 text-[#F59E0B]" />
          </h3>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(stats?.todayCollectionsPaisa || 0)}
          </div>
          <p className="text-xs text-gray-400 mt-1">Confirmed payments logged today</p>
          <div className="mt-4 pt-4 border-t border-[#262626] flex justify-between items-center text-xs">
            <span className="text-gray-400">Settlement Status:</span>
            <span className="text-emerald-400 font-medium">Ready for Shift Closing</span>
          </div>
        </Card>

        <Card className="p-5 border-[#262626]">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
            <span>Total Invoices</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </h3>
          <div className="text-2xl font-black text-white tracking-tight">
            {stats?.totalInvoicesCount || 0}
          </div>
          <p className="text-xs text-gray-400 mt-1">Total member billings created</p>
          <div className="mt-4 pt-4 border-t border-[#262626] flex justify-between items-center text-xs">
            <span className="text-gray-400">Total Settled:</span>
            <span className="text-emerald-400 font-medium">{stats?.paidInvoicesCount || 0}</span>
          </div>
        </Card>

        <Card className="p-5 border-[#262626]">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
            <span>Payment Channels</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </h3>
          <div className="space-y-1.5 pt-1 text-xs">
            {(stats?.collectionsByMethod || []).slice(0, 3).map((m) => (
              <div key={m.method} className="flex justify-between items-center">
                <span className="text-gray-400">{formatPaymentMethod(m.method)}:</span>
                <span className="font-semibold text-white">{formatCurrency(m.amountPaisa)}</span>
              </div>
            ))}
            {(stats?.collectionsByMethod || []).length === 0 && (
              <p className="text-gray-500">No channel collections today</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card className="p-5 border-[#262626]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
              <p className="text-xs text-gray-400">Latest billings generated</p>
            </div>
            <Link to="/invoices" className="text-xs text-[#F59E0B] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No recent invoices found</p>
            ) : (
              invoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#161616] hover:bg-[#1C1C1C] transition-colors border border-[#222]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{inv.invoiceNumber}</span>
                      <StatusBadge status={inv.status} type="invoice" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {inv.member?.user?.fullName || 'Gym Member'} • Due {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{formatCurrency(inv.totalPaisa)}</p>
                    <p className="text-[10px] text-gray-400">
                      Paid: {formatCurrency(inv.paidPaisa)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card className="p-5 border-[#262626]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Payments</h3>
              <p className="text-xs text-gray-400">Latest confirmed collections</p>
            </div>
            <Link to="/payments" className="text-xs text-[#F59E0B] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No recent payments logged</p>
            ) : (
              payments.map((pmt) => (
                <Link
                  key={pmt.id}
                  to={`/payments/${pmt.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#161616] hover:bg-[#1C1C1C] transition-colors border border-[#222]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{pmt.paymentNumber}</span>
                      <StatusBadge status={pmt.status} type="payment" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatPaymentMethod(pmt.method)} • {formatDate(pmt.paymentDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">
                      +{formatCurrency(pmt.amountPaisa)}
                    </p>
                    <p className="text-[10px] text-gray-400">{pmt.referenceNumber || 'Cash Desk'}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
