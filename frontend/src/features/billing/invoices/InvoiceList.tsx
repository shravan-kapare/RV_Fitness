import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, CreditCard } from 'lucide-react';
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
  const totalRecords = response?.pagination?.total;

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => (
        <span className="font-bold text-[#F5F5F5] tracking-wide">{inv.invoiceNumber}</span>
      ),
    },
    {
      key: 'member',
      header: 'Member Profile',
      render: (inv) => (
        <div>
          <p className="text-[#F5F5F5] font-semibold">{inv.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[11px] text-[#A5A5A5] tabular-nums font-mono">{inv.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'totalPaisa',
      header: 'Total Invoiced',
      align: 'right',
      render: (inv) => (
        <span className="font-bold text-[#F5F5F5] tabular-nums">{formatCurrency(inv.totalPaisa)}</span>
      ),
    },
    {
      key: 'paidPaisa',
      header: 'Amount Paid',
      align: 'right',
      render: (inv) => (
        <span className="text-emerald-400 font-semibold tabular-nums">{formatCurrency(inv.paidPaisa)}</span>
      ),
    },
    {
      key: 'balance',
      header: 'Outstanding Due',
      align: 'right',
      render: (inv) => {
        const bal = Number(inv.totalPaisa) - Number(inv.paidPaisa);
        return (
          <span className={`font-bold tabular-nums ${bal > 0 ? 'text-amber-400' : 'text-[#737373]'}`}>
            {formatCurrency(bal)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (inv) => <StatusBadge status={inv.status} type="invoice" size="sm" />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => <span className="text-[#A5A5A5] text-xs tabular-nums">{formatDate(inv.dueDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/invoices/${inv.id}`);
            }}
            className="p-1.5 h-auto text-[#A5A5A5] hover:text-[#F5F5F5]"
            title="View Invoice"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {user?.role === 'ADMIN' && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'VOID' && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/payments/record?invoiceId=${inv.id}`);
              }}
              className="text-xs px-2.5 py-1 h-auto"
            >
              <CreditCard className="w-3 h-3 mr-1" />
              <span>Collect</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight">Invoice Management</h2>
          <p className="text-xs text-[#A5A5A5]">Itemized subscriptions, issue dates, and collection tracking</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/invoices/create">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Invoice</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs
        tabs={statusTabs}
        activeTab={status}
        onChange={(tabId) => {
          setStatus(tabId);
          setPage(1);
        }}
      />

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#292929]">
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

      {/* Table */}
      <Table
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyMessage="No invoices match the selected filter."
        onRowClick={(inv) => navigate(`/invoices/${inv.id}`)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalRecords}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
