import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Receipt as ReceiptIcon, ArrowUpRight } from 'lucide-react';
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
  { id: 'CARD', label: 'Card' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
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
        <span className="font-mono font-bold text-[#F5F5F5] tracking-wide text-xs">
          {pmt.paymentNumber}
        </span>
      ),
    },
    {
      key: 'invoice',
      header: 'Invoice #',
      render: (pmt) => (
        <Link
          to={`/invoices/${pmt.invoiceId}`}
          className="text-[#FFC21A] hover:underline font-mono text-xs font-semibold inline-flex items-center gap-1"
        >
          <span>{pmt.invoice?.invoiceNumber || 'Invoice'}</span>
          <ArrowUpRight className="w-3 h-3 text-[#A5A5A5]" />
        </Link>
      ),
    },
    {
      key: 'member',
      header: 'Member Name',
      render: (pmt) => (
        <div>
          <p className="text-[#F5F5F5] font-semibold text-xs">{pmt.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[10px] font-mono text-[#A5A5A5]">{pmt.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'amountPaisa',
      header: 'Amount Paid',
      align: 'right',
      render: (pmt) => (
        <span className="font-mono font-bold tabular-nums text-emerald-400 text-xs">
          {formatCurrency(pmt.amountPaisa)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (pmt) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#171717] border border-[#292929] text-[#D4D4D4]">
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
      render: (pmt) => <span className="text-[#A5A5A5] text-xs">{formatDate(pmt.paymentDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (pmt) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/payments/${pmt.id}`)}
          className="p-1.5 h-auto text-[#A5A5A5] hover:text-[#FFC21A] hover:bg-[#1E1E1E]"
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
          <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
            Payment Transactions
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Verified cash settlements, UPI transfers, bank deposits, and member receipt records
          </p>
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

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#292929]">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search by payment #, UTR, or member..."
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
        emptyMessage="No payment transactions recorded for this filter."
      />

      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
