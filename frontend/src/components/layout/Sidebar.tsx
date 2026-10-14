import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CreditCard,
  Receipt,
  Scale,
  RefreshCw,
  CalendarCheck,
  BarChart3,
  History,
  Settings,
  LogOut,
  Dumbbell,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('ADMIN' | 'MEMBER' | 'TRAINER')[];
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupTitle: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    ],
  },
  {
    groupTitle: 'BILLING',
    items: [
      { label: 'Invoices', path: '/invoices', icon: FileText, roles: ['ADMIN', 'MEMBER'] },
      { label: 'Create Invoice', path: '/invoices/create', icon: PlusCircle, roles: ['ADMIN'] },
      { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['ADMIN', 'MEMBER'] },
      { label: 'Record Payment', path: '/payments/record', icon: PlusCircle, roles: ['ADMIN'] },
      { label: 'Receipts', path: '/receipts', icon: Receipt, roles: ['ADMIN', 'MEMBER'] },
      { label: 'Outstanding Balances', path: '/outstanding', icon: AlertCircle, roles: ['ADMIN'] },
    ],
  },
  {
    groupTitle: 'FINANCIAL OPERATIONS',
    items: [
      { label: 'Refund Management', path: '/refunds', icon: RefreshCw, roles: ['ADMIN'] },
      { label: 'Reconciliation', path: '/reconciliation', icon: Scale, roles: ['ADMIN'] },
      { label: 'Daily Closing', path: '/daily-closing', icon: CalendarCheck, roles: ['ADMIN'] },
      { label: 'Financial Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN'] },
      { label: 'Audit History', path: '/audit', icon: History, roles: ['ADMIN'] },
    ],
  },
  {
    groupTitle: 'CONFIGURATION',
    items: [
      { label: 'Billing Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-r border-[#222222]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#222222] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#FFC21A] flex items-center justify-center shrink-0 shadow-sm">
            <Dumbbell className="w-4 h-4 text-[#080808] stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-[#F5F5F5]">RV</span>
                <span className="font-extrabold text-sm tracking-wider text-[#FFC21A]">FITNESS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#A5A5A5] border border-[#292929]">
                  BILLING
                </span>
              </div>
              <span className="text-[10px] text-[#737373] tracking-widest uppercase font-medium mt-1">
                Narsobawadi
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-[#737373] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {navGroups.map((group) => {
          const filteredItems = group.items.filter((item) => {
            if (!item.roles || !user) return true;
            return item.roles.includes(user.role);
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.groupTitle} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-[#737373]">
                  {group.groupTitle}
                </div>
              )}
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group select-none',
                      isActive
                        ? 'bg-[#181818] text-[#FFC21A] font-semibold border-l-2 border-[#FFC21A] pl-2.5'
                        : 'text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#141414]'
                    )}
                  >
                    <Icon
                      className={clsx(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-[#FFC21A]' : 'text-[#737373] group-hover:text-[#A5A5A5]'
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Account Section */}
      <div className="p-3 border-t border-[#222222] bg-[#0A0A0A] shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#1C1C1C] border border-[#292929] flex items-center justify-center text-xs font-bold text-[#FFC21A] shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F5F5F5] truncate leading-tight">
                  {user?.fullName || 'User'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-[#737373] uppercase tracking-wider">
                    {user?.role || 'MEMBER'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-[#737373] hover:text-rose-400 hover:bg-[#1A1A1A] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col h-screen fixed left-0 top-0 select-none z-30 transition-all duration-200',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={clsx(
          'lg:hidden fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-200 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {renderNavContent()}
      </div>
    </>
  );
};
