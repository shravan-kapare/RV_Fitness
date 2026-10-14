import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Feature Pages
import { LoginPage } from '@/features/auth/LoginPage';
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
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MEMBER']} />}>
        <Route element={<AppLayout />}>
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/dashboard" element={<BillingDashboard />} />
          </Route>

          {/* Invoices (Admin full, Member view own) */}
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />

          {/* Admin Only Invoice Creation */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/invoices/create" element={<CreateInvoice />} />
          </Route>

          {/* Payments (Admin full, Member view own) */}
          <Route path="/payments" element={<PaymentList />} />
          <Route path="/payments/:id" element={<PaymentDetail />} />

          {/* Admin Only Payment Recording */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/payments/record" element={<RecordPayment />} />
          </Route>

          {/* Receipts (Admin + Member view) */}
          <Route path="/receipts" element={<ReceiptViewer />} />

          {/* Admin Only Management & Reporting Modules */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
