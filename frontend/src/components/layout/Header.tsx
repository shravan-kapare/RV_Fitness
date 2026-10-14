import React from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Menu, Calendar, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Billing Dashboard', subtitle: 'Real-time financial status, collections, and receivables' },
  '/invoices': { title: 'Invoices', subtitle: 'Manage issued invoices, payment progress, and status' },
  '/invoices/create': { title: 'Create Invoice', subtitle: 'Issue an itemized billing invoice with snapshotted rates' },
  '/payments': { title: 'Payment Transactions', subtitle: 'Audited ledger of recorded cash, UPI, bank, and card payments' },
  '/payments/record': { title: 'Record Payment', subtitle: 'Log incoming payment against an active invoice' },
  '/receipts': { title: 'Receipts Repository', subtitle: 'Traceable payment receipts and printable official vouchers' },
  '/outstanding': { title: 'Outstanding Receivables', subtitle: 'Accounts receivable aging breakdown and collection status' },
  '/refunds': { title: 'Refund Management', subtitle: 'Controlled reversals and auditable refund disbursements' },
  '/reconciliation': { title: 'Payment Reconciliation', subtitle: 'Compare ledger collections against physical drawer and bank totals' },
  '/daily-closing': { title: 'Daily Shift Closing', subtitle: 'End-of-shift register reconciliation and drawer balancing' },
  '/reports': { title: 'Financial Reports', subtitle: 'Revenue analysis by membership plan and payment channel' },
  '/audit': { title: 'Financial Audit Trail', subtitle: 'Immutable chronological record of administrative operations' },
  '/settings': { title: 'Billing Settings', subtitle: 'Facility credentials, numbering schemes, and tax rates' },
};

interface HeaderProps {
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const currentPath = Object.keys(pageTitles).find((path) =>
    path === location.pathname || (path !== '/' && location.pathname.startsWith(path + '/'))
  ) || '/dashboard';

  const pageInfo = pageTitles[currentPath] || {
    title: 'RV Fitness Billing',
    subtitle: 'Narsobawadi, Maharashtra',
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-[#0B0B0B] border-b border-[#222222] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#171717] rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Context */}
        <div>
          <h1 className="text-sm sm:text-base font-bold text-[#F5F5F5] tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-[11px] text-[#A5A5A5] hidden sm:block truncate max-w-md">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Header Context Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141414] border border-[#262626] text-xs text-[#A5A5A5]">
          <Calendar className="w-3.5 h-3.5 text-[#FFC21A]" />
          <span className="tabular-nums font-medium text-[#F5F5F5]">{todayFormatted}</span>
        </div>

        {/* Gym Location */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141414] border border-[#262626] text-xs text-[#A5A5A5]">
          <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
          <span>Narsobawadi Center</span>
        </div>

        {/* User Role Tag */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#171717] border border-[#292929] text-[11px] font-semibold text-[#FFC21A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFC21A]" />
          <span>{user?.role || 'STAFF'}</span>
        </div>
      </div>
    </header>
  );
};
