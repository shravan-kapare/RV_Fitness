import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';
import { Payment, PaymentMethod } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const methodTabs = [
  { id: 'ALL', label: 'All Methods' },
  { id: 'CASH', label: 'Cash' },
  { id: 'UPI', label: 'UPI' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { id: 'CARD', label: 'Card' },
];

export const PaymentList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: response, isLoading } = usePayments({
    page,
    limit: 10,
    method: method === 'ALL' ? undefined : (method as PaymentMethod),
    search: search || undefined,
  });

  const payments = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  const columns: Column<Payment>[] = [
    {
      key: 'paymentNumber',
      header: 'Payment #',
      render: (pmt) => (
        <span className="font-semibold text-white tracking-wide">{pmt.paymentNumber}</span>
      ),
    },
    {
      key: 'invoice',
      header: 'Invoice #',
      render: (pmt) => (
        <Link
          to={`/invoices/${pmt.invoiceId}`}
          className="text-[#F59E0B] hover:underline text-xs font-medium"
        >
          {pmt.invoice?.invoiceNumber || 'View Invoice'}
        </Link>
      ),
    },
    {
      key: 'member',
      header: 'Member',
      render: (pmt) => (
        <div>
          <p className="text-white font-medium">{pmt.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[11px] text-gray-400">{pmt.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'amountPaisa',
      header: 'Amount',
      render: (pmt) => (
        <span className="font-bold text-emerald-400">{formatCurrency(pmt.amountPaisa)}</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (pmt) => (
        <span className="text-xs text-gray-300 font-medium">
          {formatPaymentMethod(pmt.method)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (pmt) => <StatusBadge status={pmt.status} type="payment" />,
    },
    {
      key: 'paymentDate',
      header: 'Date Logged',
      render: (pmt) => <span className="text-gray-300 text-xs">{formatDate(pmt.paymentDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (pmt) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/payments/${pmt.id}`)}
          className="p-1.5 h-auto text-gray-400 hover:text-white"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment Transactions</h2>
          <p className="text-xs text-gray-400">All recorded offline collections, receipts, and allocations</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/payments/record">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Record Payment</span>
            </Button>
          </Link>
        )}
      </div>

      <Tabs
        tabs={methodTabs}
        activeTab={method}
        onChange={(tabId) => {
          setMethod(tabId);
          setPage(1);
        }}
      />

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#262626]">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search payment #, ref UTR, or member..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={payments}
        isLoading={isLoading}
        emptyMessage="No payment transactions found."
      />

      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
