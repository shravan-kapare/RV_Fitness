# RV Fitness — Billing & Payment Management

A comprehensive full-stack gym management and billing system for **RV Fitness**, Narsobawadi, Maharashtra, India.

This platform provides a high-performance public website, dedicated portals for **Admin**, **Trainer**, and **Member** workflows, automated billing & invoicing, A4 PDF receipts, tamper-proof QR attendance with HMAC rotation, and comprehensive financial reporting.

---

## Tech Stack

| Component | Technology |
|:---|:---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling & Motion** | Tailwind CSS + Lucide Icons + Custom CSS Motion |
| **Backend** | Node.js + TypeScript + Express |
| **Database** | MySQL 8.0+ / MariaDB 10.4+ (InnoDB Engine) |
| **ORM** | Prisma 5.x |
| **Containerization** | Docker & Docker Compose (Optional) |
| **Validation** | Zod |
| **Authentication** | JWT + bcrypt + HTTP cookies |
| **Document Engine** | PDFKit (A4 Portrait Financial Receipts) |
| **Testing** | Vitest (8 suites, 50 unit & integration tests) |

---

## Universal System Requirements

The application runs on any modern developer laptop:

- **Node.js:** v20.x or v22.x LTS ([nodejs.org](https://nodejs.org/))
- **Package Manager:** `npm` v9+ (bundled with Node.js)
- **Database Options (Pick one):**
  - **Docker Desktop** (Recommended: Windows WSL2, macOS, Linux) — zero manual DB install
  - **MySQL Community Server 8.0+** ([dev.mysql.com](https://dev.mysql.com/downloads/mysql/))
  - **XAMPP / MariaDB 10.4+** ([apachefriends.org](https://www.apachefriends.org/))
- **Operating System:** Windows 10/11, macOS, or Linux

---

## Quick Start (Universal Team Onboarding)

Follow these 5 steps to clone and run RV Fitness on your laptop:

### 1. Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/shravan-kapare/RV_Fitness.git
cd RV_Fitness

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to repository root
cd ..
```

### 2. Configure Environment Variables

Create your local `.env` file from the provided template:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example backend\.env
```

**macOS / Linux:**
```bash
cp .env.example backend/.env
```

Open `backend/.env` and review your database connection settings:

- **If using Docker Compose, XAMPP, or MariaDB (default root has no password):**
  ```env
  DATABASE_URL="mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:@localhost:3306/rvfitness_test?connection_limit=5"
  ```
- **If using standard MySQL 8.0 with a root password:**
  ```env
  DATABASE_URL="mysql://root:YourPassword@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:YourPassword@localhost:3306/rvfitness_test?connection_limit=5"
  ```

---

### 3. Start Database Server (Port 3306)

Choose **one** of the following options according to your preferred setup:

#### Option A: Docker Compose (Recommended — Zero DB Install, Cross-Platform)
If you have Docker Desktop or Docker Engine installed, run:
```bash
docker compose up -d
```
*This starts a pre-configured MySQL 8.0 container on port 3306 with the `rvfitness_dev` database already created.*

#### Option B: Local MySQL Service (Native Installation)
If you installed MySQL Community Server directly on your laptop:
- **Windows:** Run in PowerShell as Administrator:
  ```powershell
  Start-Service MySQL
  ```
  *(or start via `services.msc`)*
- **macOS (Homebrew):**
  ```bash
  brew services start mysql
  ```
- **Linux (systemd):**
  ```bash
  sudo systemctl start mysql
  ```

#### Option C: XAMPP / MariaDB
- Start the **MySQL** module from the XAMPP Control Panel, or run `C:\xampp\mysql_start.bat`.

#### Verifying Database Connectivity:
```bash
# Windows PowerShell:
Test-NetConnection -ComputerName localhost -Port 3306

# macOS / Linux:
nc -z 127.0.0.1 3306
```

---

### 4. Initialize Database Schema & Seed Data

> ⚠️ **CRITICAL RULE: Always use `npm run db:push`. DO NOT run `prisma migrate dev`.**  
> The application schema contains 30+ models and custom enums synchronized via `prisma db push`. Running `npx prisma migrate dev` on a database with tables created via `db push` will detect schema drift and prompt you to **reset the database**, which permanently deletes gym members, attendance logs, and financial records.

Run the initialization commands from the `backend` folder:

```bash
cd backend

# 1. Generate Prisma Client bindings
npm run db:generate

# 2. Safely synchronize database tables and indexes
npm run db:push

# 3. Create the initial Super-Admin account (admin@rvfitness.com)
npm run db:seed-admin

# 4. (Optional) Populate complete demo gym data (plans, trainers, demo members)
npm run db:seed
```

---

### 5. Start the Application

You can start the full stack using one of our automated startup orchestrators or manually in three terminals:

#### Method 1: Automated Startup Scripts

- **Windows (PowerShell):**
  ```powershell
  .\start-dev.ps1
  ```
  *Auto-detects database listeners (or starts local MySQL/MariaDB), then launches Backend and Frontend in separate windows.*

- **Windows (Command Prompt / Batch):**
  ```cmd
  run.bat
  ```

- **macOS & Linux (Bash):**
  ```bash
  chmod +x start-dev.sh
  ./start-dev.sh
  ```

#### Method 2: Manual Three-Terminal Sequence (All Operating Systems)

Open three separate terminals in this exact order:

1. **Terminal 1 (Database):** Port 3306 active (via Docker, service, or XAMPP).
2. **Terminal 2 (Backend API):**
   ```bash
   cd backend
   npm run dev
   ```
   *Express server listening on `http://localhost:3000`*
3. **Terminal 3 (Frontend SPA):**
   ```bash
   cd frontend
   npm run dev
   ```
   *Vite client listening on `http://localhost:5173`*

---

## Application Access Points

| Component | URL | Description |
|:---|:---|:---|
| **Public Website** | [http://localhost:5173](http://localhost:5173) | Gym showcase, membership plans, facilities, trainers |
| **Portal Login** | [http://localhost:5173/login](http://localhost:5173/login) | Unified login for Admin, Trainer, and Member accounts |
| **Backend API Gateway** | [http://localhost:3000](http://localhost:3000) | Express REST API |
| **API Health Check** | [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) | Live system & MySQL connectivity check |

### Default Seed Credentials

| Role | Email | Password | Permissions |
|:---|:---|:---|:---|
| **Admin** | `admin@rvfitness.com` | `Admin@123456` | Full platform access (Billing, Members, Trainers, CMS, Reports, Audit) |
| **Trainer** | `trainer@rvfitness.com` | `Trainer@123456` | Trainer portal, member rosters, workout tracking |
| **Member** | `rohit.shinde@example.com` | `Member@123456` | Member portal, digital membership card, live QR pass, payment history |

---

## Project Structure

```
RV_Fitness/
├── docker-compose.yml          # One-click MySQL 8.0 development container
├── start-dev.ps1               # Windows PowerShell startup orchestrator
├── start-dev.sh                # macOS & Linux startup orchestrator
├── run.bat                     # Windows batch launcher
├── .env.example                # Global environment configuration template
├── backend/                    # Express REST API & Prisma ORM
│   ├── prisma/
│   │   └── schema.prisma       # 30+ tables, custom enums & relations
│   ├── src/
│   │   ├── config/             # Environment, DB, logger configuration
│   │   ├── middleware/         # Auth, RBAC, validation, rate limiting
│   │   ├── modules/            # Domain modules (auth, billing, members, etc.)
│   │   │   ├── auth/           # JWT auth & refresh tokens
│   │   │   ├── users/          # User accounts
│   │   │   ├── members/        # Member records & profiles
│   │   │   └── billing/        # Invoices, payments, receipts, refunds, closing
│   │   ├── shared/             # Financial arithmetic (paisa math), errors
│   │   └── types/              # TypeScript definitions
│   ├── scripts/                # Seeding scripts (seed-admin.ts, seed-data.ts)
│   └── tests/                  # Automated Vitest test suite (50 tests)
├── frontend/                   # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/         # Shared UI components (layout, nav, cards)
│   │   ├── features/           # Portals (Public, Admin, Trainer, Member)
│   │   ├── hooks/              # React Query API hooks
│   │   ├── lib/                # API client, formatters, storage
│   │   └── stores/             # Zustand state management
│   └── vite.config.ts          # Reverse proxy to backend (:3000)
├── docs/                       # Comprehensive documentation
│   ├── LOCAL_SETUP_AND_TROUBLESHOOTING.md # In-depth OS setup & troubleshooting
│   ├── BACKUP_RESTORE.md       # MySQL backup, mysqldump & disaster recovery
│   └── API_CONTRACT.md         # REST API schema contract
└── README.md
```

---

## Available Scripts

### Backend (`/backend`)

| Command | Description |
|:---|:---|
| `npm run dev` | Start development API server with tsx watch hot-reload |
| `npm run build` | Compile TypeScript into production CommonJS bundle |
| `npm start` | Run compiled production server |
| `npm run db:generate` | Generate Prisma client type definitions |
| `npm run db:push` | Safely push schema changes to MySQL (never drops data) |
| `npm run db:seed-admin` | Seed initial super-admin user |
| `npm run db:seed` | Populate database with complete demo gym dataset |
| `npm test` | Run all 8 Vitest suites (50 unit & integration tests) |
| `npm run test:watch` | Run tests in interactive watch mode |

### Frontend (`/frontend`)

| Command | Description |
|:---|:---|
| `npm run dev` | Start Vite development server with HMR on port 5173 |
| `npm run build` | Build optimized production distribution in `dist/` |
| `npm run preview` | Locally preview the production build |

---

## Financial Conventions

- **Paisa-based integer arithmetic:** All currency values are stored as integers in **paisa** (`1 INR = 100 paisa`). Avoids JavaScript floating-point rounding issues.
- **Basis Points for Tax:** Tax rates are stored in basis points (`1800 bps = 18.00% GST`).
- **Snapshotted Line Items:** Membership plan prices are snapshotted onto invoice line items upon creation, shielding historical invoices from future plan price changes.
- **ACID Transactions:** All financial writes (payments, invoices, refunds, closing) use Prisma `$transaction` guarantees.
- **Immutable Receipts:** Once issued, financial receipts cannot be modified or deleted.

---

## Automated Test Suite

To verify backend financial logic, PDF generation, and security:

```bash
cd backend
npm test
```

Expected output: **8 test files passed (50 tests passing)** covering:
- Financial arithmetic (`paisaToRupees`, `calculateTax`, discount allocation)
- A4 Portrait receipt layout and GST compliance
- Dynamic QR code token HMAC signing and replay attack prevention
- Invoice state transitions and payment idempotency

---

## In-Depth Documentation

For detailed guides, troubleshooting, and enterprise setup:

- 📖 [**Local Setup, Database Architecture & Troubleshooting Guide** (`docs/LOCAL_SETUP_AND_TROUBLESHOOTING.md`)](./docs/LOCAL_SETUP_AND_TROUBLESHOOTING.md)
- 💾 [**Database Backup, Restore & Point-in-Time Recovery** (`docs/BACKUP_RESTORE.md`)](./docs/BACKUP_RESTORE.md)
- 📑 [**API Contract & Data Dictionary** (`API_CONTRACT.md`)](./API_CONTRACT.md)

---

## License

Private repository — RV Fitness, Narsobawadi, Maharashtra, India.
