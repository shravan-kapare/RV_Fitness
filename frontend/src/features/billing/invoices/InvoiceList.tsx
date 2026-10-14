import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Invoice, InvoiceStatus } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const statusTabs = [
  { id: 'ALL', label: 'All Invoices' },
  { id: 'ISSUED', label: 'Issued' },
  { id: 'PARTIALLY_PAID', label: 'Partial' },
  { id: 'PAID', label: 'Paid' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'DRAFT', label: 'Draft' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export const InvoiceList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: response, isLoading } = useInvoices({
    page,
    limit: 10,
    status: status === 'ALL' ? undefined : (status as InvoiceStatus),
    search: search || undefined,
  });

  const invoices = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => (
        <span className="font-semibold text-white tracking-wide">{inv.invoiceNumber}</span>
      ),
    },
    {
      key: 'member',
      header: 'Member Name',
      render: (inv) => (
        <div>
          <p className="text-white font-medium">{inv.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[11px] text-gray-400">{inv.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'totalPaisa',
      header: 'Total Amount',
      render: (inv) => (
        <span className="font-semibold text-white">{formatCurrency(inv.totalPaisa)}</span>
      ),
    },
    {
      key: 'paidPaisa',
      header: 'Paid Amount',
      render: (inv) => (
        <span className="text-emerald-400 font-medium">{formatCurrency(inv.paidPaisa)}</span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance Due',
      render: (inv) => {
        const bal = Number(inv.totalPaisa) - Number(inv.paidPaisa);
        return (
          <span className={`font-semibold ${bal > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
            {formatCurrency(bal)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <StatusBadge status={inv.status} type="invoice" />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => <span className="text-gray-300 text-xs">{formatDate(inv.dueDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/invoices/${inv.id}`)}
            className="p-1.5 h-auto text-gray-400 hover:text-white"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {user?.role === 'ADMIN' && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/payments/record?invoiceId=${inv.id}`)}
              className="text-xs px-2.5 py-1 h-auto"
            >
              Pay
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Invoice Records</h2>
          <p className="text-xs text-gray-400">All registered member billings and itemized plans</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/invoices/create">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Invoice</span>
            </Button>
          </Link>
        )}
      </div>

      <Tabs
        tabs={statusTabs}
        activeTab={status}
        onChange={(tabId) => {
          setStatus(tabId);
          setPage(1);
        }}
      />

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#262626]">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search invoice # or member name..."
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
        data={invoices}
        isLoading={isLoading}
        emptyMessage="No invoices match the selected filter."
      />

      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
