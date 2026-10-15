import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Public Website Views
import { PublicLayout } from '@/features/public/PublicLayout';
import { HomePage } from '@/features/public/HomePage';
import { AboutPage } from '@/features/public/AboutPage';
import { MembershipsPage } from '@/features/public/MembershipsPage';
import { FacilitiesPage } from '@/features/public/FacilitiesPage';
import { TrainersPage } from '@/features/public/TrainersPage';
import { EventsPage } from '@/features/public/EventsPage';
import { GalleryPage } from '@/features/public/GalleryPage';
import { OffersPage } from '@/features/public/OffersPage';
import { ContactPage } from '@/features/public/ContactPage';

// Auth View
import { LoginPage } from '@/features/auth/LoginPage';

// Member Portal Views
import { MemberDashboard } from '@/features/member/MemberDashboard';
import { DigitalIdCard } from '@/features/member/DigitalIdCard';
import { MyWorkouts } from '@/features/member/MyWorkouts';
import { MyDiets } from '@/features/member/MyDiets';
import { MyProgress } from '@/features/member/MyProgress';

// Trainer Workspace
import { TrainerDashboard } from '@/features/trainer/TrainerDashboard';

// Admin Operations Views
import { MembersManager } from '@/features/admin/MembersManager';
import { AttendanceDesk } from '@/features/admin/AttendanceDesk';
import { MembershipsRenewals } from '@/features/admin/MembershipsRenewals';
import { PlansBenefitsManager } from '@/features/admin/PlansBenefitsManager';
import { TrainersManager } from '@/features/admin/TrainersManager';
import { ExpensesManager } from '@/features/admin/ExpensesManager';
import { CmsManager } from '@/features/admin/CmsManager';
import { NotificationsCenter } from '@/features/admin/NotificationsCenter';

// Financial & Billing Management Views
import { BillingDashboard } from '@/features/billing/dashboard/BillingDashboard';
import { InvoiceList } from '@/features/billing/invoices/InvoiceList';
import { CreateInvoice } from '@/features/billing/invoices/CreateInvoice';
import { InvoiceDetail } from '@/features/billing/invoices/InvoiceDetail';
import { PaymentList } from '@/features/billing/payments/PaymentList';
import { RecordPayment } from '@/features/billing/payments/RecordPayment';
import { PaymentDetail } from '@/features/billing/payments/PaymentDetail';
import { ReceiptViewer } from '@/features/billing/receipts/ReceiptViewer';
import { OutstandingBalances } from '@/features/billing/outstanding/OutstandingBalances';
import { RefundManagement } from '@/features/billing/refunds/RefundManagement';
import { PaymentReconciliation } from '@/features/billing/reconciliation/PaymentReconciliation';
import { DailyClosingView } from '@/features/billing/daily-closing/DailyClosing';
import { FinancialReports } from '@/features/billing/reports/FinancialReports';
import { AuditHistory } from '@/features/billing/audit/AuditHistory';
import { BillingSettings } from '@/features/billing/settings/BillingSettings';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Website Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/memberships" element={<MembershipsPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/trainers" element={<TrainersPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* 2. Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* 3. Authenticated Application Portals */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MEMBER', 'TRAINER']} />}>
        <Route element={<AppLayout />}>
          {/* Member Self-Service Portal */}
          <Route element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/qr" element={<DigitalIdCard />} />
            <Route path="/member/workouts" element={<MyWorkouts />} />
            <Route path="/member/diets" element={<MyDiets />} />
            <Route path="/member/progress" element={<MyProgress />} />
          </Route>

          {/* Trainer Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
            <Route path="/trainer" element={<TrainerDashboard />} />
          </Route>

          {/* Shared Admin & Trainer Turnstile Desk */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']} />}>
            <Route path="/admin/attendance" element={<AttendanceDesk />} />
          </Route>

          {/* Admin Operations & Business Management */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/dashboard" element={<BillingDashboard />} />
            <Route path="/admin/members" element={<MembersManager />} />
            <Route path="/admin/memberships" element={<MembershipsRenewals />} />
            <Route path="/admin/plans" element={<PlansBenefitsManager />} />
            <Route path="/admin/trainers" element={<TrainersManager />} />
            <Route path="/admin/expenses" element={<ExpensesManager />} />
            <Route path="/admin/cms" element={<CmsManager />} />
            <Route path="/admin/notifications" element={<NotificationsCenter />} />
          </Route>

          {/* Financial & Billing Management (Admin Only) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/payments/:id" element={<PaymentDetail />} />
            <Route path="/payments/record" element={<RecordPayment />} />
            <Route path="/receipts" element={<ReceiptViewer />} />
            <Route path="/outstanding" element={<OutstandingBalances />} />
            <Route path="/refunds" element={<RefundManagement />} />
            <Route path="/reconciliation" element={<PaymentReconciliation />} />
            <Route path="/daily-closing" element={<DailyClosingView />} />
            <Route path="/reports" element={<FinancialReports />} />
            <Route path="/audit" element={<AuditHistory />} />
            <Route path="/settings" element={<BillingSettings />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
