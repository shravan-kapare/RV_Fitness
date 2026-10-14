import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ShieldCheck, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Billing Dashboard', subtitle: 'Overview of gym revenues, collections, and financial health' },
  '/invoices': { title: 'Invoices', subtitle: 'Manage member billing, issued plans, and payment statuses' },
  '/invoices/create': { title: 'Generate Invoice', subtitle: 'Create an itemized billing invoice for a member' },
  '/payments': { title: 'Payment Transactions', subtitle: 'Audited log of all member payment transactions' },
  '/payments/record': { title: 'Record Offline Payment', subtitle: 'Log cash, UPI, bank transfer, or card payments' },
  '/receipts': { title: 'Receipts Repository', subtitle: 'Download and print verified GST/billing receipts' },
  '/outstanding': { title: 'Outstanding & Aging Balances', subtitle: 'Monitor receivables and overdue invoice aging' },
  '/refunds': { title: 'Refund Management', subtitle: 'Process and audit member payment refunds and credit reversions' },
  '/reconciliation': { title: 'Financial Reconciliation', subtitle: 'Match recorded ledger transactions against external statements' },
  '/daily-closing': { title: 'Daily Cash & Digital Closing', subtitle: 'Audit shift collections against declared totals' },
  '/reports': { title: 'Financial Analytics & Reports', subtitle: 'Revenue breakdowns, collections, and GST summary' },
  '/audit': { title: 'Immutable Audit Trail', subtitle: 'Complete log of sensitive administrative actions' },
  '/settings': { title: 'Billing Configuration', subtitle: 'Gym metadata, tax rates, and numbering schemas' },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const currentPath = Object.keys(pageTitles).find((path) =>
    path === location.pathname || (path !== '/' && location.pathname.startsWith(path + '/'))
  ) || '/dashboard';

  const pageInfo = pageTitles[currentPath] || {
    title: 'RV Fitness Billing',
    subtitle: 'Narsobawadi, Maharashtra',
  };

  return (
    <header className="h-16 bg-[#111111]/90 backdrop-blur-md border-b border-[#262626] px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-gray-400 hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Location Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs text-gray-300">
          <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Narsobawadi Center</span>
        </div>

        {/* Role Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{user?.role || 'MEMBER'}</span>
        </div>

        {/* Notifications Icon (Placeholder) */}
        <button
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] absolute top-2 right-2 ring-2 ring-[#111111]"></span>
        </button>
      </div>
    </header>
  );
};
