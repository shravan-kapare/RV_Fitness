import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MapPin, Menu, Calendar, ShieldCheck, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const pageTitles: Record<string, { title: string; subtitle: string; category?: string }> = {
  '/dashboard': { title: 'Billing & Operations Dashboard', subtitle: 'Real-time financial status, collections, and receivables', category: 'ADMIN' },
  '/admin/attendance': { title: 'Turnstile Access Control', subtitle: 'Live verified member check-ins & RFID desk operations', category: 'OPERATIONS' },
  '/admin/memberships': { title: 'Subscriptions & Renewals', subtitle: 'Active member packages, renewal cycles, and freeze controls', category: 'MEMBERSHIPS' },
  '/admin/plans': { title: 'Membership Plans & Benefits', subtitle: 'Manage plan pricing, durations, and bundled facility privileges', category: 'CONFIGURATION' },
  '/admin/trainers': { title: 'Trainer Roster & Staff', subtitle: 'Certified coach assignments, credentials, and client loads', category: 'STAFF' },
  '/admin/expenses': { title: 'Operational Expenses', subtitle: 'Track rent, electricity, maintenance, and gym facility overhead', category: 'EXPENSES' },
  '/admin/cms': { title: 'Website CMS & Inquiries', subtitle: 'Manage public gallery, challenge events, and incoming leads', category: 'CMS' },
  '/admin/notifications': { title: 'Broadcast Center', subtitle: 'Send announcements, desk reminders, and gym alerts to members', category: 'COMMUNICATIONS' },
  '/invoices': { title: 'Invoices Repository', subtitle: 'Manage issued invoices, payment progress, and status', category: 'BILLING' },
  '/invoices/create': { title: 'Create Invoice', subtitle: 'Issue an itemized billing invoice with snapshotted rates', category: 'BILLING' },
  '/payments': { title: 'Payment Transactions', subtitle: 'Audited ledger of recorded cash, UPI, bank, and card payments', category: 'PAYMENTS' },
  '/payments/record': { title: 'Record Payment', subtitle: 'Log incoming payment against an active invoice', category: 'PAYMENTS' },
  '/receipts': { title: 'Receipts Repository', subtitle: 'Traceable payment receipts and printable official vouchers', category: 'RECEIPTS' },
  '/outstanding': { title: 'Outstanding Receivables', subtitle: 'Accounts receivable aging breakdown and collection status', category: 'AGING' },
  '/refunds': { title: 'Refund Management', subtitle: 'Controlled reversals and auditable refund disbursements', category: 'REFUNDS' },
  '/reconciliation': { title: 'Payment Reconciliation', subtitle: 'Compare ledger collections against physical drawer and bank totals', category: 'CONTROL' },
  '/daily-closing': { title: 'Daily Shift Closing', subtitle: 'End-of-shift register reconciliation and drawer balancing', category: 'CLOSING' },
  '/reports': { title: 'Financial Reports', subtitle: 'Revenue analysis by membership plan and payment channel', category: 'REPORTS' },
  '/audit': { title: 'Financial Audit Trail', subtitle: 'Immutable chronological record of administrative operations', category: 'SECURITY' },
  '/settings': { title: 'Facility & Billing Settings', subtitle: 'Gym credentials, numbering schemes, and tax rates', category: 'SETTINGS' },
  '/trainer': { title: 'Trainer Command Center', subtitle: 'Assigned athletes, daily workout assignments, and nutrition plans', category: 'COACHING' },
  '/member': { title: 'Member Sanctuary', subtitle: 'Personal workout routines, nutrition targets, and gym access', category: 'PORTAL' },
  '/member/qr': { title: 'Turnstile Digital Pass', subtitle: 'Present your verified QR token at the desk turnstile scanner', category: 'ACCESS' },
  '/member/workouts': { title: 'Assigned Workout Split', subtitle: 'Structured exercises, sets, reps, and coach guidelines', category: 'FITNESS' },
  '/member/diets': { title: 'Nutrition & Macro Targets', subtitle: 'Personalized caloric targets, meal schedule, and hydration', category: 'NUTRITION' },
  '/member/progress': { title: 'Biometrics & Progress', subtitle: 'Weight changes, BMI measurements, and physical transformation', category: 'PROGRESS' },
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
    title: 'RV Fitness Platform',
    subtitle: 'Narsobawadi, Maharashtra',
    category: 'OVERVIEW',
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-[#080808]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Context */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#FFC21A] uppercase tracking-wider">
              {pageInfo.category}
            </span>
            <span className="text-white/20 text-xs">/</span>
            <h1 className="text-sm sm:text-base font-bold text-[#F5F5F5] tracking-tight">
              {pageInfo.title}
            </h1>
          </div>
          <p className="text-[11px] text-[#9CA3AF] hidden sm:block truncate max-w-lg mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Header Context Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-[#9CA3AF] font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#FFC21A]" />
          <span>{todayFormatted}</span>
        </div>

        {/* Location Badge */}
        <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-[#9CA3AF]">
          <MapPin className="w-3 h-3 text-[#FFC21A]" />
          <span className="font-mono text-[11px]">Narsobawadi</span>
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#1A1A20] border border-white/10 flex items-center justify-center text-xs font-bold text-[#FFC21A]">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <p className="font-bold text-[#F5F5F5] truncate max-w-[120px]">{user.fullName}</p>
              <p className="text-[10px] text-[#FFC21A] font-mono uppercase font-semibold">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
