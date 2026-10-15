import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  X,
  QrCode,
  Users,
  Activity,
  Apple,
  Globe,
  Bell,
  DollarSign,
  Package,
  Layers,
  MessageSquare,
  Sparkles,
  UserCheck,
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
  id: string;
  groupTitle: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'overview',
    groupTitle: 'Overview',
    items: [
      { label: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
      { label: 'Trainer Command', path: '/trainer', icon: Users, roles: ['TRAINER'] },
      { label: 'Member Sanctuary', path: '/member', icon: Dumbbell, roles: ['MEMBER'] },
    ],
  },
  {
    id: 'operations',
    groupTitle: 'Gym Operations',
    items: [
      { label: 'Members', path: '/admin/members', icon: Users, roles: ['ADMIN'] },
      { label: 'Turnstile Desk', path: '/admin/attendance', icon: QrCode, roles: ['ADMIN', 'TRAINER'] },
      { label: 'Memberships & Renewals', path: '/admin/memberships', icon: CalendarCheck, roles: ['ADMIN'] },
      { label: 'Plans & Benefits', path: '/admin/plans', icon: Package, roles: ['ADMIN'] },
      { label: 'Trainers & Staff', path: '/admin/trainers', icon: UserCheck, roles: ['ADMIN'] },
    ],
  },
  {
    id: 'finance',
    groupTitle: 'Finance',
    items: [
      { label: 'Invoices', path: '/invoices', icon: FileText, roles: ['ADMIN'] },
      { label: 'Payments', path: '/payments', icon: CreditCard, roles: ['ADMIN'] },
      { label: 'Receipts', path: '/receipts', icon: Receipt, roles: ['ADMIN'] },
      { label: 'Outstanding Balances', path: '/outstanding', icon: AlertCircle, roles: ['ADMIN'] },
      { label: 'Expenses', path: '/admin/expenses', icon: DollarSign, roles: ['ADMIN'] },
      { label: 'Refunds', path: '/refunds', icon: RefreshCw, roles: ['ADMIN'] },
      { label: 'Reconciliation', path: '/reconciliation', icon: Scale, roles: ['ADMIN'] },
      { label: 'Daily Closing', path: '/daily-closing', icon: CalendarCheck, roles: ['ADMIN'] },
      { label: 'Financial Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN'] },
    ],
  },
  {
    id: 'website',
    groupTitle: 'Website & Communication',
    items: [
      { label: 'Website Content', path: '/admin/cms?tab=CONTENT', icon: Globe, roles: ['ADMIN'] },
      { label: 'Offers & Coupons', path: '/admin/cms?tab=OFFERS', icon: Sparkles, roles: ['ADMIN'] },
      { label: 'Events & Challenges', path: '/admin/cms?tab=EVENTS', icon: Layers, roles: ['ADMIN'] },
      { label: 'Gallery Media', path: '/admin/cms?tab=GALLERY', icon: Layers, roles: ['ADMIN'] },
      { label: 'Inquiries', path: '/admin/cms?tab=INQUIRIES', icon: MessageSquare, roles: ['ADMIN'] },
      { label: 'Announcements', path: '/admin/notifications', icon: Bell, roles: ['ADMIN'] },
    ],
  },
  {
    id: 'member_services',
    groupTitle: 'Member Services',
    items: [
      { label: 'Digital Turnstile Pass', path: '/member/qr', icon: QrCode, roles: ['MEMBER'] },
      { label: 'Assigned Workouts', path: '/member/workouts', icon: Dumbbell, roles: ['MEMBER'] },
      { label: 'Nutrition & Macros', path: '/member/diets', icon: Apple, roles: ['MEMBER'] },
      { label: 'Biometrics & Progress', path: '/member/progress', icon: Activity, roles: ['MEMBER'] },
    ],
  },
  {
    id: 'admin',
    groupTitle: 'Administration',
    items: [
      { label: 'Audit History', path: '/audit', icon: History, roles: ['ADMIN'] },
      { label: 'Billing Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
      { label: 'Public Website', path: '/', icon: Globe, roles: ['ADMIN', 'TRAINER', 'MEMBER'] },
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

  // Collapsible groups state (all expanded by default)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Auto-expand group that contains active link
  useEffect(() => {
    navGroups.forEach((group) => {
      const hasActive = group.items.some((item) => {
        if (item.path.includes('?')) {
          const [basePath] = item.path.split('?');
          return location.pathname === basePath;
        }
        return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
      });

      if (hasActive) {
        setCollapsedGroups((prev) => ({ ...prev, [group.id]: false }));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-[#111114] border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0 bg-[#0C0C0F]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-[#FFC21A] flex items-center justify-center shrink-0 shadow-md shadow-[#FFC21A]/10">
            <Dumbbell className="w-4 h-4 text-[#080808] stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">RV</span>
                <span className="font-black text-sm tracking-tight text-[#FFC21A]">FITNESS</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#A5A5A5] border border-white/10">
                  {user?.role || 'GYM'}
                </span>
              </div>
              <span className="text-[10px] text-[#71717A] tracking-wider uppercase font-mono mt-1">
                Narsobawadi
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups (Independently Scrollable) */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 custom-scrollbar">
        {navGroups.map((group) => {
          const filteredItems = group.items.filter((item) => {
            if (!item.roles || !user) return true;
            return item.roles.includes(user.role);
          });

          if (filteredItems.length === 0) return null;

          const isGroupCollapsed = collapsedGroups[group.id] && !isCollapsed;

          return (
            <div key={group.id} className="space-y-1">
              {/* Collapsible Group Header */}
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-[#71717A] hover:text-white rounded-md transition-colors cursor-pointer"
                >
                  <span>{group.groupTitle}</span>
                  <ChevronDown
                    className={clsx(
                      'w-3 h-3 transition-transform duration-200 text-[#71717A]',
                      isGroupCollapsed && '-rotate-90'
                    )}
                  />
                </button>
              ) : (
                <div className="my-2 border-t border-white/5" />
              )}

              {/* Items List */}
              {(!isGroupCollapsed || isCollapsed) && (
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    let isActive = false;

                    if (item.path.includes('?')) {
                      const [basePath, query] = item.path.split('?');
                      const params = new URLSearchParams(query);
                      const currentParams = new URLSearchParams(location.search);
                      const tabParam = params.get('tab');
                      isActive =
                        location.pathname === basePath &&
                        (!tabParam || currentParams.get('tab') === tabParam);
                    } else {
                      isActive =
                        location.pathname === item.path ||
                        (item.path !== '/' &&
                          item.path !== '/dashboard' &&
                          location.pathname.startsWith(`${item.path}/`));
                    }

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        title={isCollapsed ? item.label : undefined}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 group select-none relative',
                          isActive
                            ? 'bg-[#1C1C24] text-white font-bold border border-white/10 shadow-sm'
                            : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FFC21A] rounded-r-full" />
                        )}
                        <Icon
                          className={clsx(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive ? 'text-[#FFC21A]' : 'text-[#71717A] group-hover:text-white'
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-white/10 bg-[#0C0C0F] shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#1C1C24] border border-white/10 flex items-center justify-center text-xs font-bold font-mono text-[#FFC21A] shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.fullName || 'User'}
                </p>
                <span className="text-[10px] font-mono font-semibold text-[#71717A] uppercase tracking-wider block mt-0.5">
                  {user?.role || 'MEMBER'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Log Out of Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Rail */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col h-screen fixed left-0 top-0 select-none z-30 transition-all duration-200',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
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
