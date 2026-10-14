# RV Fitness — Billing & Payment Management

A comprehensive billing and payment management system for **RV Fitness**, Narsobawadi, Maharashtra, India.

Built as part of the gym management application suite. This module handles invoices, payments, receipts, refunds, reconciliation, and financial reporting.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + TypeScript + Express |
| Database | MySQL 8.0+ / MariaDB (InnoDB) |
| ORM | Prisma 5.x |
| Validation | Zod |
| Authentication | JWT + bcrypt |
| PDF Generation | PDFKit |
| Testing | Vitest |

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **MySQL** 8.0+ or **MariaDB** 10.4+
- **npm** 9+

---

## Quick Start

### 1. Clone and install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Copy the example env file
cp .env.example backend/.env

# Edit backend/.env with your database credentials and secrets
# IMPORTANT: Change JWT_SECRET and JWT_REFRESH_SECRET to secure random values
```

### 3. Set up the database

```bash
cd backend

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Create the initial admin user
npm run db:seed-admin

# (Optional) Seed development data
npm run db:seed
```

### 4. Start the application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Health:** http://localhost:3000/api/v1/health

### 5. Login

Use the admin credentials configured in your `.env` file:
- **Email:** admin@rvfitness.com (or your configured ADMIN_EMAIL)
- **Password:** The ADMIN_PASSWORD you set in `.env`

> ⚠️ **Change the default admin password immediately after first login.**

---

## Project Structure

```
RV_Fitness/
├── backend/                    # Express API server
│   ├── prisma/                 # Database schema & migrations
│   ├── src/
│   │   ├── config/             # Environment, database, logging
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── users/          # User management
│   │   │   ├── members/        # Member profiles (integration stub)
│   │   │   └── billing/        # Billing & payments
│   │   │       ├── invoices/
│   │   │       ├── payments/
│   │   │       ├── receipts/
│   │   │       ├── refunds/
│   │   │       ├── reconciliation/
│   │   │       ├── reports/
│   │   │       ├── audit/
│   │   │       ├── daily-closing/
│   │   │       ├── adjustments/
│   │   │       └── settings/
│   │   ├── shared/             # Utilities (financial math, pagination)
│   │   └── types/              # TypeScript types
│   ├── scripts/                # Admin seeding, data seeding
│   └── tests/                  # Automated tests
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   ├── features/           # Feature pages
│   │   ├── hooks/              # API hooks
│   │   ├── lib/                # API client, formatters
│   │   ├── stores/             # State management
│   │   └── types/              # TypeScript types
├── docs/                       # Documentation
├── PROJECT_ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_CONTRACT.md
└── BILLING_IMPLEMENTATION_PLAN.md
```

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed-admin` | Create initial admin user |
| `npm run db:seed` | Seed development data |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Roles & Permissions

| Feature | ADMIN | MEMBER | TRAINER |
|---------|-------|--------|---------|
| Create Invoices | ✅ | ❌ | ❌ |
| View All Invoices | ✅ | ❌ | ❌ |
| View Own Invoices | ✅ | ✅ | ❌ |
| Record Payments | ✅ | ❌ | ❌ |
| View All Payments | ✅ | ❌ | ❌ |
| View Own Payments | ✅ | ✅ | ❌ |
| Download Receipts | ✅ | ✅ (own) | ❌ |
| Manage Refunds | ✅ | ❌ | ❌ |
| Reconciliation | ✅ | ❌ | ❌ |
| Financial Reports | ✅ | ❌ | ❌ |
| Audit History | ✅ | ❌ | ❌ |
| Billing Settings | ✅ | ❌ | ❌ |

---

## Financial Conventions

- All monetary values are stored as **integers in paisa** (1 INR = 100 paisa)
- Tax rates are stored in **basis points** (1800 bps = 18%)
- Invoice prices are **snapshotted** at creation time — plan price changes don't affect existing invoices
- All financial operations use **database transactions** for atomicity
- Payments are **never deleted** — only reversed through auditable workflows
- Receipts are **immutable** once generated

---

## Database Backup & Restore

### Backup
```bash
pg_dump -U rvfitness -h localhost -d rvfitness_dev -F c -f backup_$(date +%Y%m%d).dump
```

### Restore
```bash
pg_restore -U rvfitness -h localhost -d rvfitness_dev -c backup_20241215.dump
```

---

## Team Integration

This module is designed for integration with other RV Fitness modules:

- **Members Module:** Define member profiles linked to user accounts
- **Memberships Module:** Define membership plans and member subscriptions
- **Trainers Module:** Trainer profiles (no billing access)

See [API_CONTRACT.md](./API_CONTRACT.md) and [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for integration details.

### Shared Entities
- `users` — Authentication accounts (shared)
- `members` — Member profiles (owned by Members module)
- `membership_plans` — Plan definitions (owned by Memberships module)
- `memberships` — Subscriptions (owned by Memberships module)

---

## Security

- JWT-based authentication with short-lived access tokens
- bcrypt password hashing (cost factor 12)
- Server-side role and ownership checks on every protected endpoint
- Zod validation on all request bodies
- Rate limiting on authentication endpoints
- No card numbers, UPI PINs, or banking credentials stored
- Complete financial audit trail
- Environment variables for all secrets

---

## License

Private — RV Fitness, Narsobawadi, Maharashtra, India
