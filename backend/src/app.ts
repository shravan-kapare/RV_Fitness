import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './shared/errors';

// Route imports
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { memberRoutes } from './modules/members/member.routes';
import { planRoutes } from './modules/plans/plan.routes';
import { invoiceRoutes } from './modules/billing/invoices/invoice.routes';
import { paymentRoutes } from './modules/billing/payments/payment.routes';
import { receiptRoutes } from './modules/billing/receipts/receipt.routes';
import { refundRoutes } from './modules/billing/refunds/refund.routes';
import { adjustmentRoutes } from './modules/billing/adjustments/adjustment.routes';
import { reconciliationRoutes } from './modules/billing/reconciliation/reconciliation.routes';
import { dailyClosingRoutes } from './modules/billing/daily-closing/closing.routes';
import { reportRoutes } from './modules/billing/reports/report.routes';
import { auditRoutes } from './modules/billing/audit/audit.routes';
import { settingsRoutes } from './modules/billing/settings/settings.routes';
import { prisma } from './config/database';

// Enable BigInt serialization across all JSON responses
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

export const app: Express = express();

// Security and middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Health check endpoints
const healthHandler = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      service: 'RV Fitness Billing API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: env.NODE_ENV,
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      service: 'RV Fitness Billing API',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
};

app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Mount feature module API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/membership-plans', planRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/refunds', refundRoutes);
app.use('/api/v1/adjustments', adjustmentRoutes);
app.use('/api/v1/reconciliation', reconciliationRoutes);
app.use('/api/v1/daily-closings', dailyClosingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/settings', settingsRoutes);

// 404 handler
app.use((req: Request, _res: Response, next) => {
  next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handler
app.use(errorHandler);
