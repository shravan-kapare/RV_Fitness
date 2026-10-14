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
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('ADMIN' | 'MEMBER' | 'TRAINER')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { label: 'Invoices', path: '/invoices', icon: FileText, roles: ['ADMIN', 'MEMBER'] },
  { label: 'Create Invoice', path: '/invoices/create', icon: PlusCircle, roles: ['ADMIN'] },
  { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['ADMIN', 'MEMBER'] },
  { label: 'Record Payment', path: '/payments/record', icon: PlusCircle, roles: ['ADMIN'] },
  { label: 'Receipts', path: '/receipts', icon: Receipt, roles: ['ADMIN', 'MEMBER'] },
  { label: 'Outstanding Balances', path: '/outstanding', icon: AlertCircle, roles: ['ADMIN'] },
  { label: 'Refund Management', path: '/refunds', icon: RefreshCw, roles: ['ADMIN'] },
  { label: 'Reconciliation', path: '/reconciliation', icon: Scale, roles: ['ADMIN'] },
  { label: 'Daily Closing', path: '/daily-closing', icon: CalendarCheck, roles: ['ADMIN'] },
  { label: 'Financial Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN'] },
  { label: 'Audit History', path: '/audit', icon: History, roles: ['ADMIN'] },
  { label: 'Billing Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || !user) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="w-64 bg-[#111111] border-r border-[#262626] flex flex-col h-screen fixed left-0 top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#262626] gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Dumbbell className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-wider text-white">RV</span>
          <span className="font-bold text-lg tracking-wider text-[#F59E0B] ml-1">FITNESS</span>
          <span className="block text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            Billing Portal
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Financial Management
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-gray-400'}`} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-[#262626] bg-[#0E0E0E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#262626] border border-[#333] flex items-center justify-center text-xs font-bold text-[#F59E0B] uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-[10px] text-gray-400 uppercase font-medium">{user?.role || 'MEMBER'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-[#1A1A1A] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
