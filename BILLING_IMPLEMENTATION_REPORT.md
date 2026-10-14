# RV FITNESS — BILLING & PAYMENT MANAGEMENT MODULE
## Complete System Implementation Report (MySQL 8.0+ / MariaDB Edition)

**Author / Lead Engineer:** Senior Full-Stack & Systems Architect  
**Client / Facility:** RV Fitness, Narsobawadi, Maharashtra, India  
**Module:** Billing & Payment Management (Production Foundation)  
**Date:** October 2026  
**Status:** Complete, Verified & Production-Ready  

---

## 1. Executive Summary & Verification Overview

The **Billing & Payment Management module** and application foundation for **RV Fitness** has been constructed from scratch as a high-performance modular monolith backed by **MySQL 8.0+ / MariaDB (InnoDB engine)**.

### System Verification Metrics
| Component | Verification Command | Status | Details |
|---|---|---|---|
| **Backend TypeScript Build** | `npx tsc --noEmit` | **PASS (0 errors)** | Strict types, BigInt minor units, full domain models |
| **Backend Test Suite (Vitest)** | `npm test` | **PASS (22/22 tests)** | 17 financial unit tests + 5 live MySQL transaction integration tests |
| **Frontend Production Build** | `npm run build` (Vite) | **PASS (0 errors)** | 2,371 modules compiled; CSS 44kB; JS bundle 497kB |
| **Database Engine & Schema** | `npx prisma generate` | **PASS (Pinned v5.22.0)** | 15 normalized MySQL InnoDB models with snake_case mappings |
| **Versioned Migrations** | `npx prisma migrate dev` | **PASS** | Migration `20261014072555_init_mysql` committed and tracked |
| **API Contract & Documentation**| OpenAPI 3.0 | **PASS** | Complete specification at `docs/openapi.yaml` |

---

## 2. Technology Stack & Directory Layout

### Selected Stack
- **Backend:** Node.js 20+ with TypeScript, Express 5, Prisma ORM (MySQL provider), PDFKit, Winston, Zod, JWT & bcryptjs.
- **Database:** MySQL 8.0+ / MariaDB (InnoDB tables, `utf8mb4` character set, `BIGINT` minor-unit / paisa precision, ACID transactions, foreign keys, row locking, and versioned migrations).
- **Frontend:** React 18 with TypeScript, Vite, Tailwind CSS, TanStack React Query, Zustand, Lucide React, and React Hot Toast.
- **Branding & Visual Identity:** RV Fitness theme featuring deep charcoal surfaces (`#0A0A0A`, `#111111`, `#161616`), metallic amber/gold accents (`#F59E0B`, `#D97706`), white primary typography, and crisp financial data tables.

### Repository Structure
```
i:\Antigravity\RV_Fitness\
├── .env.example                     # Environment template (no secrets in source)
├── README.md                        # Project documentation and team onboarding
├── PROJECT_ARCHITECTURE.md          # Architecture decisions, state machines, security model
├── DATABASE_SCHEMA.md               # 15 normalized database tables & entity relationships (MySQL InnoDB)
├── API_CONTRACT.md                  # Detailed endpoint schemas & conventions
├── BILLING_IMPLEMENTATION_PLAN.md   # 10-phase milestone execution plan
├── docs\
│   ├── openapi.yaml                 # OpenAPI 3.0 API specification
│   └── BACKUP_RESTORE.md            # MySQL backup, restore & disaster recovery (mysqldump, PITR)
├── backend\
│   ├── prisma\
│   │   ├── schema.prisma            # 15 models, relations, enums, @@map tables (MySQL)
│   │   └── migrations\              # Versioned migrations (20261014072555_init_mysql)
│   ├── src\
│   │   ├── config\                  # env validation (Zod), database singleton, logger
│   │   ├── shared\                  # financial.ts, numberGenerator.ts, errors.ts, pagination.ts
│   │   ├── types\                   # shared Express and JWT interfaces
│   │   ├── middleware\              # auth, authorize, validate, errorHandler, rateLimiter
│   │   ├── modules\
│   │   │   ├── auth\                # JWT authentication & role-based issuance
│   │   │   ├── users\               # User directory & profile management
│   │   │   ├── members\             # Integration contract stubs for Member teammates
│   │   │   ├── plans\               # Integration contract stubs for MembershipPlan teammates
│   │   │   └── billing\
│   │   │       ├── invoices\        # Snapshot pricing, status transitions, balance tracking
│   │   │       ├── payments\        # Offline collections (Cash/UPI/Bank/Card), allocations
│   │   │       ├── receipts\        # Printable vouchers & PDFKit branded PDF generation
│   │   │       ├── refunds\         # Request -> Approve -> Process workflow
│   │   │       ├── adjustments\     # Credit/debit adjustments & linked reversals
│   │   │       ├── reconciliation\  # Variance checks between ledger & bank/cash declarations
│   │   │       ├── daily-closing\   # Shift cash-drawer balancing & closing
│   │   │       ├── reports\         # Financial analytics, collections breakdown, aging
│   │   │       ├── audit\           # Immutable audit logging
│   │   │       └── settings\        # Facility metadata & tax configurations
│   │   ├── app.ts                   # Express server assembly & middleware pipelines
│   │   └── server.ts                # Process entry point
│   ├── scripts\
│   │   ├── seed-admin.ts            # Idempotent bootstrap script for first admin user
│   │   └── seed-data.ts             # Realistic seed dataset for local testing
│   └── tests\                       # Vitest test suites (22 tests: unit + MySQL integration)
└── frontend\
    ├── src\
    │   ├── lib\                     # api.ts (Axios + interceptors), auth.ts, formatters.ts
    │   ├── stores\                  # authStore.ts (Zustand state)
    │   ├── hooks\                   # 12 React Query hooks for real backend endpoints
    │   ├── components\
    │   │   ├── layout\              # Sidebar, Header, AppLayout, ProtectedRoute
    │   │   └── ui\                  # Button, Card, Modal, Table, StatCard, Badge, Tabs, etc.
    │   ├── features\
    │   │   ├── auth\                # LoginPage with demo credential presets
    │   │   └── billing\             # All 15 required billing pages (Dashboard, Invoices,
    │   │                            # Payments, Receipts, Aging, Refunds, Daily Closing, etc.)
    │   ├── Router.tsx               # Route guard mapping with role enforcement
    │   └── App.tsx                  # QueryClientProvider & Toaster root
```

---

## 3. Financial & Business Rules Enforced

1. **Integer Minor-Unit (Paisa) Arithmetic:**
   - In accordance with banking best practices, all currency amounts are stored and computed in integer paisa (`BigInt` / `BIGINT` on backend and database, numeric integer on frontend) to prevent floating-point rounding errors.
   - Example: ₹1,500.50 is stored strictly as `150050n`.

2. **Snapshot Pricing Integrity:**
   - When an invoice is generated for a membership plan, the item price and GST rate are permanently snapshotted into `InvoiceItem`. Future plan price alterations never modify historical invoices.

3. **Immutable Transactions & Auditable Reversals:**
   - Payments and receipts are strictly immutable once confirmed. Reversals and refunds do not delete payment rows; they generate linked `FinancialAdjustment` and `Refund` audit records and update the invoice balance atomically using Prisma `$transaction` across InnoDB tables.

4. **Multi-Payment & Partial Payment Allocation:**
   - Invoices support multiple partial payments over time. Outstanding balance is computed as `totalPaisa - paidPaisa`. Overpayments beyond the remaining balance are rejected at the service layer.

5. **Server-Enforced Role-Based Authorization:**
   - `ADMIN`: Full billing portal access (Invoices, Payments, Receipts, Refunds, Reconciliation, Daily Closings, Settings, Reports, Audit).
   - `MEMBER`: Access limited exclusively to viewing their own invoices, payments, and receipts.
   - `TRAINER`: Zero billing permissions (403 Forbidden enforced via middleware).

6. **Sequential Financial Document Identifiers:**
   - Sequential, tamper-evident numbers are generated atomically:
     - Invoices: `RV-INV-YYYY-NNNN`
     - Payments: `RV-PAY-YYYY-NNNN`
     - Receipts: `RV-REC-YYYY-NNNN`
     - Refunds: `RV-REF-YYYY-NNNN`
     - Member Codes: `RV-YYYY-NNNN`

---

## 4. Complete 15-Page Billing Portal Implementation

All 15 required views are fully built with real API data flows, loading spinners, empty states, search, filtering, and role-based guards:

1. **Billing Dashboard (`/dashboard`)**:
   - Real-time KPI StatCards (Total Revenue Realized, Outstanding Balance, Overdue Invoices, Today's Collections).
   - Shift Register Status, Invoices Status, Payment Channel share, Recent Invoices and Recent Payments tables.
2. **Invoice List (`/invoices`)**:
   - Status tabs (All, Issued, Partial, Paid, Overdue, Draft, Cancelled), debounce search, member code, amount and balance display, pagination, and direct pay actions.
3. **Create Invoice (`/invoices/create`)**:
   - Member search selector, payment due date picker, dynamic line items with plan auto-fill or custom items, real-time tax calculation, discount deduction, and notes.
4. **Invoice Details (`/invoices/:id`)**:
   - Itemized line items table, GST breakdown, status transitions (Issue, Cancel), payment history with linked receipt vouchers.
5. **Record Payment (`/payments/record`)**:
   - Offline payment recording for Cash, UPI, Bank Transfer, and Card. Remaining balance auto-fill, UTR reference validation, staff memo.
6. **Payment Transactions (`/payments`)**:
   - Audited transaction log filterable by payment method (Cash, UPI, Bank, Card), search by UTR, member, and date range.
7. **Payment Details (`/payments/:id`)**:
   - Linked invoice overview, payer details, receipt link, and administrative payment reversal action with audit log.
8. **Receipt Viewer & PDF Download (`/receipts`)**:
   - Modal printable receipt preview with RV Fitness branding, official GST voucher metadata, and one-click PDF download via backend PDFKit stream.
9. **Outstanding Balances & Aging (`/outstanding`)**:
   - Receivables categorization by aging brackets (Current, 1-30 days overdue, 31-60, 61-90, 90+ critical) with quick collection shortcut buttons.
10. **Refund Management (`/refunds`)**:
    - Reversal workflow: Request Refund modal, eligibility checks, Approve, and Disburse/Process actions with audit logs.
11. **Payment Reconciliation (`/reconciliation`)**:
    - Period audit comparing recorded ledger collections against declared physical cash and bank digital credits with automated discrepancy variance calculations.
12. **Daily Collection Closing (`/daily-closing`)**:
    - End-of-shift register closing comparing recorded shift collections with physical drawer cash and digital settlement totals.
13. **Financial Reports (`/reports`)**:
    - Comprehensive analytics with date window filters: Financial Summary, Payment Method Channel breakdown, and Revenue by Plan.
14. **Financial Audit History (`/audit`)**:
    - Chronological, immutable administrative audit log tracking operator, action, entity type, and modified JSON snapshots.
15. **Billing Settings (`/settings`)**:
    - Configuration portal for gym legal name, address, GSTIN, document prefixes, default GST tax rate (in basis points), and overdue grace days.

---

## 5. Team Integration Guide for Other Developers

Teammates implementing other modules (**Members**, **Trainers**, **Memberships**, **Fitness Tracker**) can work immediately against the agreed MySQL schemas and endpoints without breaking billing:

### Member Module Integration
- **Foreign Key:** `Invoice.memberId` and `Payment.memberId` reference `Member.id` (`VARCHAR(36)` UUID).
- **Member Creation:** When a new member registers, create a row in the `Member` table linked to their `User` ID with a unique `memberCode`.
- **Pre-built Endpoints:** `GET /api/v1/members` and `GET /api/v1/members/:id` are already implemented in `backend/src/modules/members/`.

### Membership Plans Integration
- **Plan Reference:** Invoices snapshot plan prices from `MembershipPlan`. Teammates can manage plans via `backend/src/modules/plans/` routes (`GET /api/v1/membership-plans`).
- **Duration & Activation:** Memberships can be activated upon confirmed invoice payment by listening to the `PAYMENT_CONFIRMED` event or checking `Invoice.status === 'PAID'`.

---

## 6. How to Run Locally

### 1. Database Setup
```bash
# In backend directory:
cd i:\Antigravity\RV_Fitness\backend
npm install
npx prisma generate
npx prisma migrate dev
npx tsx scripts/seed-admin.ts
npx tsx scripts/seed-data.ts
```

### 2. Run Backend Tests
```bash
npm test
# 22 tests passing across 5 suites (17 unit + 5 MySQL transaction tests)
```

### 3. Start Backend Development Server
```bash
npm run dev
# Server listening on http://localhost:3000
```

### 4. Start Frontend
```bash
cd i:\Antigravity\RV_Fitness\frontend
npm run dev
# Vite dev server running at http://localhost:5173
```

### 5. Log in with Seeded Credentials
- **Admin Staff:** `admin@rvfitness.com` / `Admin@123456`
- **Gym Member:** `rohit.shinde@example.com` / `Member@123456`
