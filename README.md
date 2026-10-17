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

- **Node.js:** v20.x or v22.x LTS ([nodejs.org](https://nodejs.org/))
- **Database Server:** **MySQL 8.0+** or **MariaDB 10.4+** (InnoDB storage engine)
- **Package Manager:** **npm** v9+
- **Operating System:** Windows 10/11, macOS, or Linux

---

## Quick Start

### 1. Clone and Install Dependencies

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..\frontend
npm install
```

### 2. Configure Environment

Copy the example environment file and configure your local database connection:

```powershell
cd I:\Antigravity\RV_Fitness
Copy-Item .env.example backend\.env
```

- **For local XAMPP / MariaDB (default root has no password):**
  ```env
  DATABASE_URL="mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:@localhost:3306/rvfitness_test?connection_limit=5"
  ```
- **For standard MySQL 8.0 (with a root password):**
  ```env
  DATABASE_URL="mysql://root:YourPassword@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:YourPassword@localhost:3306/rvfitness_test?connection_limit=5"
  ```

### 3. Start Database Server (Port 3306)

Start your database server **first** so port 3306 is listening:

- **Verified Local Machine Setup (MariaDB on `N:` drive):**
  ```powershell
  & "N:\cyber\mysql\bin\mysqld.exe" --defaults-file="N:\cyber\mysql\bin\my.ini" --console
  ```
  *(Keep this terminal open while using the application)*
- **Portable Setup for Other Developers:**
  - If using standard Windows MySQL Service: `Start-Service MySQL` (or start via `services.msc`).
  - If using XAMPP on `C:` drive: Start MySQL via XAMPP Control Panel or `C:\xampp\mysql_start.bat`.
  - If using Docker: `docker run --name rv-mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=rvfitness_dev -p 3306:3306 -d mysql:8.0`

**Verify Database Connection:**
```powershell
# Test TCP listener:
Test-NetConnection -ComputerName localhost -Port 3306

# Test SQL connection & InnoDB support:
# (On verified local setup:)
& "N:\cyber\mysql\bin\mysql.exe" -u root -h 127.0.0.1 -P 3306 -e "SELECT VERSION(); SHOW ENGINES;"
# (Or using standard PATH mysql:)
mysql -u root -h 127.0.0.1 -P 3306 -e "SELECT VERSION(); SHOW ENGINES;"
```

### 4. Initialize Database Schema & Seed Data

> ⚠️ **IMPORTANT: Use `npm run db:push`, DO NOT run `prisma migrate dev`.**  
> The application schema contains 30+ tables and custom enums synchronized via `prisma db push`. Running `prisma migrate dev` on an existing database will detect schema drift and prompt you to **reset the database**, which will **permanently erase existing members and payment records**.

```powershell
cd backend

# Generate Prisma client
npm run db:generate

# Synchronize database schema safely
npm run db:push

# Create super-admin account (admin@rvfitness.com)
npm run db:seed-admin

# (Optional) Seed complete gym demo data (plans, trainers, members)
npm run db:seed
```

### 5. Start the Application

You can start all services either using the **verified manual 3-terminal procedure** (recommended for full log visibility) or the **automated helper script**:

#### Option A: Manual Three-Terminal Procedure (Recommended)
Open three separate terminals in this exact order:

1. **Terminal 1 (Database):** Start MySQL/MariaDB on port 3306.
2. **Terminal 2 (Backend API):**
   ```powershell
   cd I:\Antigravity\RV_Fitness\backend
   npm run dev
   ```
3. **Terminal 3 (Frontend Client):**
   ```powershell
   cd I:\Antigravity\RV_Fitness\frontend
   npm run dev
   ```

#### Option B: Automated Startup Helper (Windows PowerShell)
```powershell
cd I:\Antigravity\RV_Fitness
.\start-dev.ps1
```
*Checks port 3306 first, starts MariaDB if needed, and launches backend and frontend in dedicated windows.*

---

## Application Access Points

| Component | URL | Description |
| :--- | :--- | :--- |
| **Public Website** | [http://localhost:5173](http://localhost:5173) | Gym homepage, memberships, facilities, trainers |
| **Portal Login** | [http://localhost:5173/login](http://localhost:5173/login) | Unified login for Admin, Trainer, and Member accounts |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | Express REST API gateway |
| **API Health Check** | [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) | Live system & database connection status |

### Default Seed Credentials

- **Admin:** `admin@rvfitness.com` / `Admin@123456`
- **Trainer:** `trainer@rvfitness.com` / `Trainer@123456`
- **Member:** `rohit.shinde@example.com` / `Member@123456`

For advanced setup, Windows service repair, and troubleshooting, see:  
👉 [**Local Setup & Troubleshooting Guide** (`docs/LOCAL_SETUP_AND_TROUBLESHOOTING.md`)](./docs/LOCAL_SETUP_AND_TROUBLESHOOTING.md)

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

## Database Backup & Restore (MySQL / MariaDB)

For enterprise backup schedules, binlog replication, and automated disaster recovery, refer to:
👉 [**Database Backup & Restoration Guide** (`docs/BACKUP_RESTORE.md`)](./docs/BACKUP_RESTORE.md)

### Quick Manual Backup (PowerShell / Bash)
```powershell
# Windows (PowerShell)
$date = Get-Date -Format "yyyyMMdd_HHmmss"
mysqldump -u root -h localhost -P 3306 --single-transaction --databases rvfitness_dev > "rvfitness_backup_$date.sql"
```

### Quick Restore
```powershell
mysql -u root -h localhost -P 3306 rvfitness_dev < "rvfitness_backup_TIMESTAMP.sql"
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
