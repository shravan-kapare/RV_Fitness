# RV Fitness — Project Architecture

## Overview

RV Fitness is a gym management application for RV Fitness, Narsobawadi, Maharashtra, India. The application is designed as a **modular monolith** with a React frontend and Express backend, enabling independent development of modules by different team members.

**Current Module:** Billing & Payment Management
**Future Modules:** Members, Trainers, Memberships, Fitness Tracking, Attendance

---

## Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend | React + TypeScript | 18.x | Component-based UI with type safety |
| Build Tool | Vite | 5.x | Fast HMR, native ESM support |
| Styling | Tailwind CSS | 3.x | Utility-first, consistent design system |
| Backend | Node.js + Express | 20+ / 4.x | Stable, well-documented API framework |
| Language | TypeScript | 5.x | End-to-end type safety |
| Database | MySQL / MariaDB | 8.0+ / 10.4+ | ACID compliance (InnoDB), robust integer minor-unit financial ops |
| ORM | Prisma | 5.x | Type-safe queries, versioned migrations |
| Validation | Zod | 3.x | Runtime validation with TypeScript inference |
| Auth | JWT + bcrypt | - | Stateless auth with secure password hashing |
| PDF | PDFKit | 0.14.x | Programmatic PDF generation for invoices/receipts |
| Testing | Vitest | 1.x | Fast, Vite-native test runner |
| API Docs | OpenAPI 3.0 | - | Standard API contract documentation |
| Logging | Winston | 3.x | Structured, leveled application logging |

---

## Project Structure

```
RV_Fitness/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Versioned migrations
│   ├── src/
│   │   ├── config/                # Environment, database, app config
│   │   │   ├── env.ts
│   │   │   ├── database.ts
│   │   │   └── logger.ts
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   ├── authorize.ts       # Role-based authorization
│   │   │   ├── validate.ts        # Zod request validation
│   │   │   ├── errorHandler.ts    # Centralized error handling
│   │   │   └── rateLimiter.ts     # Rate limiting
│   │   ├── modules/               # Feature modules
│   │   │   ├── auth/              # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.schema.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── users/             # User management
│   │   │   ├── billing/           # Billing & Payment module
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── invoice.controller.ts
│   │   │   │   │   ├── invoice.service.ts
│   │   │   │   │   ├── invoice.schema.ts
│   │   │   │   │   └── invoice.routes.ts
│   │   │   │   ├── payments/
│   │   │   │   ├── receipts/
│   │   │   │   ├── refunds/
│   │   │   │   ├── reconciliation/
│   │   │   │   ├── reports/
│   │   │   │   ├── audit/
│   │   │   │   └── settings/
│   │   │   └── members/           # Shared interfaces (stub)
│   │   ├── shared/                # Shared utilities
│   │   │   ├── errors.ts          # Custom error classes
│   │   │   ├── pagination.ts      # Pagination helpers
│   │   │   ├── financial.ts       # Money arithmetic (paisa)
│   │   │   └── idempotency.ts     # Idempotency key handling
│   │   ├── types/                 # Shared TypeScript types
│   │   ├── app.ts                 # Express app setup
│   │   └── server.ts              # Server entry point
│   ├── tests/
│   │   ├── setup.ts               # Test database setup
│   │   ├── helpers/               # Test utilities
│   │   ├── unit/                  # Unit tests
│   │   └── integration/           # API integration tests
│   ├── scripts/
│   │   ├── seed-admin.ts          # Initial admin provisioning
│   │   └── backup-db.sh           # Database backup script
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/            # Shared UI components
│   │   │   ├── ui/                # Base components (Button, Card, Table, etc.)
│   │   │   ├── layout/            # Layout components (Sidebar, Header, etc.)
│   │   │   └── common/            # Domain-agnostic components
│   │   ├── features/              # Feature-based modules
│   │   │   ├── auth/              # Login, session management
│   │   │   ├── billing/           # All billing pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── invoices/
│   │   │   │   ├── payments/
│   │   │   │   ├── receipts/
│   │   │   │   ├── refunds/
│   │   │   │   ├── reconciliation/
│   │   │   │   ├── reports/
│   │   │   │   ├── audit/
│   │   │   │   ├── daily-closing/
│   │   │   │   └── settings/
│   │   │   └── members/           # Placeholder for member module
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # API client, utilities
│   │   │   ├── api.ts             # Axios instance with interceptors
│   │   │   ├── auth.ts            # Auth token management
│   │   │   └── formatters.ts      # Currency, date formatting
│   │   ├── stores/                # State management (Zustand)
│   │   ├── types/                 # Shared TypeScript types
│   │   ├── App.tsx
│   │   ├── Router.tsx             # Route configuration with guards
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/
│   ├── openapi.yaml               # OpenAPI 3.0 specification
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACT.md
│   └── BACKUP_RESTORE.md
├── .env.example
├── .gitignore
├── README.md
└── PROJECT_ARCHITECTURE.md
```

---

## Architecture Decisions

### 1. Modular Monolith
Each business domain (billing, members, trainers) is a self-contained module within a single deployable application. Modules communicate through well-defined service interfaces and shared database schemas with foreign keys.

### 2. Financial Arithmetic — Paisa (Minor Unit Integer)
All monetary values are stored and computed as **integers in paisa** (1 INR = 100 paisa). This eliminates floating-point rounding errors. Conversion to INR happens only at the presentation layer.

### 3. Immutable Financial Records
Invoices snapshot prices at creation time. Payments are never deleted — only reversed through linked adjustment records. Receipts are immutable once generated.

### 4. State Machine for Financial Entities
Invoices, payments, and refunds follow explicit state machines:

**Invoice:** `DRAFT → ISSUED → PARTIALLY_PAID → PAID → OVERDUE → CANCELLED → VOID`
**Payment:** `PENDING → CONFIRMED → FAILED → REVERSED`
**Refund:** `REQUESTED → APPROVED → PROCESSED → REJECTED`

### 5. Audit Trail
Every financial mutation records who, what, when, and why in a dedicated audit_logs table. Soft deletes are used where appropriate.

### 6. Authentication & Authorization
- JWT access tokens (15 min) + refresh tokens (7 days)
- bcrypt password hashing (cost factor 12)
- Role-based access control (ADMIN, MEMBER, TRAINER)
- Ownership checks: members can only view their own records
- Initial admin created via secure CLI script, not API

### 7. Idempotency
Payment operations accept an idempotency key to prevent duplicate transactions from network retries.

### 8. Database Transactions
All financial write operations (create payment, process refund, daily closing) use Prisma interactive transactions with appropriate isolation levels.

---

## Security Model

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT with RS256 consideration, bcrypt passwords |
| Authorization | Middleware role checks + resource ownership verification |
| Input Validation | Zod schemas on all request bodies/params |
| SQL Injection | Prisma parameterized queries |
| XSS | React auto-escaping, CSP headers |
| CSRF | SameSite cookies, token-based auth |
| Rate Limiting | express-rate-limit on auth endpoints |
| Secrets | Environment variables, never in source |
| Financial Data | No card numbers, UPI PINs, or banking passwords stored |
| Audit | Complete trail of financial operations |

---

## Integration Boundaries

### Shared Entities (Owned by other modules, referenced by billing)
- **Users** — Owned by Auth module, extended by all
- **Members** — Will be owned by Members module; billing references `member_id`
- **Membership Plans** — Will be owned by Memberships module; billing snapshots plan details
- **Memberships** — Will be owned by Memberships module; billing creates invoices for memberships

### Integration Contract
Until Members and Memberships modules are built:
1. The database schema defines the full relational structure
2. Billing module references members/memberships via foreign keys
3. Seed data provides test members for development
4. The API contract documents required fields for integration
5. No hardcoded members in production — the billing module requires valid member records

---

## Environment Configuration

The application uses a layered configuration:
1. `.env` file (git-ignored) for local development
2. Environment variables for production
3. `.env.example` committed with placeholder values
4. Validation at startup — missing required vars cause immediate failure

---

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   React SPA     │────▶│  Express API    │────▶│  MySQL /     │
│   (Vite build)  │     │  (Node.js)      │     │  MariaDB     │
│   Port 5173     │     │  Port 3000      │     │  Port 3306   │
└─────────────────┘     └─────────────────┘     └──────────────┘
```

- Frontend serves static assets, proxies API calls to backend
- Backend handles all business logic, auth, and database access
- MySQL / MariaDB (InnoDB) stores all persistent data with ACID transaction guarantees
