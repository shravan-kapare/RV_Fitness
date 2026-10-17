# RV FITNESS — Universal Local Setup, Database Architecture & Troubleshooting Guide

**Platform:** RV Fitness Full-Stack Gym Management System  
**Supported OS:** Windows 10 / 11, macOS, Linux  
**Database Engines:** MySQL 8.0+ or MariaDB 10.4+ (InnoDB Engine) or Docker  
**Backend:** Node.js 20+ (Express + TypeScript + Prisma ORM)  
**Frontend:** React 18 + TypeScript + Vite  

---

## 1. System Architecture Overview

The RV Fitness application operates as a full-stack system communicating across three localhost services:

```
┌─────────────────────────────────┐
│     Frontend Client (Vite)      │  Port 5173 (http://localhost:5173)
│   React 18 + TypeScript + SPA   │
└────────────────┬────────────────┘
                 │ Reverse Proxy: /api/* -> :3000
                 ▼
┌─────────────────────────────────┐
│       Backend API Server        │  Port 3000 (http://localhost:3000)
│ Express + TypeScript + Prisma   │  Health Check: /api/v1/health
└────────────────┬────────────────┘
                 │ MySQL Connection (TCP)
                 ▼
┌─────────────────────────────────┐
│   Database Server (InnoDB)      │  Port 3306 (localhost:3306)
│   MySQL 8.0+ / MariaDB 10.4+    │  Database: rvfitness_dev
└─────────────────────────────────┘
```

### Supported Database Setups on Developer Laptops

Team members can use whichever database setup suits their operating system:

| Environment | Setup Method | Root Password | Connection URL in `backend/.env` |
|:---|:---|:---|:---|
| **Any OS (Docker)** | `docker compose up -d` | *None* | `mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10` |
| **Windows (MySQL 8.0 Installer)** | Windows Service (`MySQL80` / `MySQL`) | *Your set password* | `mysql://root:YourPassword@localhost:3306/rvfitness_dev?connection_limit=10` |
| **Windows (XAMPP / MariaDB)** | XAMPP Control Panel | *None* | `mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10` |
| **macOS (Homebrew)** | `brew services start mysql` | *None or set* | `mysql://root:YourPassword@localhost:3306/rvfitness_dev?connection_limit=10` |
| **Linux (apt / dnf)** | `sudo systemctl start mysql` | *None or set* | `mysql://root:YourPassword@localhost:3306/rvfitness_dev?connection_limit=10` |

*(Note: On the project author's host workstation, MariaDB runs from `N:\cyber\mysql` with an empty root password).*

---

## 2. Why Manual `npx prisma migrate dev` Failed (Root Cause Analysis)

When team members run `npx prisma migrate dev` on an existing database and encounter:
```text
Error: P1001: Can't reach database server at localhost:3306
```
or receive prompts to reset the database, here is why:

### Root Cause 1: Database Listener Was Not Running
Prisma does not bundle an embedded database engine; it requires an active database listener on TCP port 3306. When MySQL/MariaDB or Docker is not running, port 3306 is closed, triggering Prisma error `P1001`.

### Root Cause 2: Orphaned Windows Service (Common Windows Issue)
On some Windows machines, `services.msc` lists a service named `MySQL80` pointing to an uninstalled or non-existent path like `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"`. If Windows fails to start that service, developers must either start their real MySQL binary (e.g. XAMPP, Docker) or clean up the orphaned service entry.

### Root Cause 3: Schema Synchronization Method (`db:push` vs `migrate dev`)
The RV Fitness database schema contains 30+ tables and custom enums (`schema.prisma` has 990+ lines).
- In development, the database schema is synchronized using **`prisma db push`** (`npm run db:push`).
- The `_prisma_migrations` tracking table is intentionally not used for rapid development iterations.
- **CRITICAL WARNING:** Running `npx prisma migrate dev` on a database with tables created via `prisma db push` will detect schema drift and prompt you to **reset the database** (`prisma migrate reset`), which will **permanently wipe all gym member, payment, and attendance records**. Always use `npm run db:push` in development.

---

## 3. Starting and Stopping the Application

To ensure smooth operation, the application services should be started in this exact order: **Database first, Backend second, Frontend third**.

### Method 1: Automated Startup Scripts

#### Windows (PowerShell):
```powershell
.\start-dev.ps1
```
*Features:*
- Tests port 3306 first. If active (e.g. Docker or Windows Service), reuses it without spawning duplicates.
- If port 3306 is closed, auto-detects MySQL/MariaDB from standard installation paths and launches it.
- Launches Backend (`npm run dev`) and Frontend (`npm run dev`) in dedicated windows.

#### Windows (Command Prompt / Batch):
```cmd
run.bat
```

#### macOS & Linux (Bash):
```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

### Method 2: Manual Three-Terminal Sequence (All Operating Systems)

#### **Terminal 1: Start Database Server (Port 3306)**

Choose your database engine:

- **Docker:**
  ```bash
  docker compose up -d
  ```
- **Windows MySQL Service:**
  ```powershell
  Start-Service MySQL
  ```
- **XAMPP (Windows):**
  Start MySQL via the XAMPP Control Panel.
- **macOS:**
  ```bash
  brew services start mysql
  ```
- **Linux:**
  ```bash
  sudo systemctl start mysql
  ```

#### **Terminal 2: Start Backend Server (Port 3000)**
```bash
cd backend
npm run dev
```
*Expected Output:*
```text
✅ MySQL database connected successfully.
info: 🚀 RV Fitness Billing API is running on port 3000
info: 📋 API Health: http://localhost:3000/api/v1/health
```

#### **Terminal 3: Start Frontend Client (Port 5173)**
```bash
cd frontend
npm run dev
```
*Expected Output:*
```text
  VITE v8.3.4  ready in 766 ms
  ➜  Local:   http://localhost:5173/
```

---

### Stopping the Application Safely

When finishing development work:
1. **Frontend:** Press `Ctrl + C` in Terminal 3 (or close the Vite window).
2. **Backend:** Press `Ctrl + C` in Terminal 2 (or close the Express window).
3. **Database:**
   - If using Docker: `docker compose down`
   - If running in a console window: Press `Ctrl + C` for an orderly InnoDB buffer pool flush.
   - If running as a service: Stop the service gracefully.

---

## 4. First-Time Setup on a New Developer Machine

Follow this reproducible checklist when setting up RV Fitness on any clean laptop:

### Step 1: Install Required Software
1. **Node.js:** v20.x or v22.x LTS ([nodejs.org](https://nodejs.org/))
2. **Git:** ([git-scm.com](https://git-scm.com/))
3. **Database Server:** Any of:
   - **Docker Desktop** (Easiest — zero local DB install)
   - **MySQL Community Server 8.0+**
   - **XAMPP / MariaDB 10.4+**

### Step 2: Clone Repository & Install Dependencies
```bash
git clone https://github.com/shravan-kapare/RV_Fitness.git
cd RV_Fitness

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 3: Configure Environment Variables
Copy the example configuration file:

**Windows PowerShell:**
```powershell
Copy-Item .env.example backend\.env
```

**macOS / Linux:**
```bash
cp .env.example backend/.env
```

Open `backend/.env` and review your `DATABASE_URL`:
- **Docker / XAMPP / MariaDB (root has no password):**
  ```env
  DATABASE_URL="mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:@localhost:3306/rvfitness_test?connection_limit=5"
  ```
- **Standard MySQL 8.0 (with a root password):**
  ```env
  DATABASE_URL="mysql://root:YourPassword@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:YourPassword@localhost:3306/rvfitness_test?connection_limit=5"
  ```

### Step 4: Create Database & Push Schema
1. Start your database server (e.g. `docker compose up -d` or start your local MySQL service).
2. If not using Docker, create the development and test databases:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rvfitness_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rvfitness_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
   *(If your root has no password, omit `-p`)*
3. Generate Prisma client & synchronize schema:
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   ```
   > ⚠️ **DO NOT run `prisma migrate dev`** on an existing database, as it will prompt to drop existing tables. Always use `npm run db:push`.

### Step 5: Seed Admin Account & Demo Data
```bash
# Create super-admin account (admin@rvfitness.com)
npm run db:seed-admin

# Seed membership plans, certified trainers, benefits catalog, and demo members
npm run db:seed
```

---

## 5. Fixing Windows MySQL Service Issues

If you are on Windows and an old `MySQL80` service entry fails to start because of a non-existent `C:\Program Files\...` path:

### Remove an Orphaned Windows Service
Run an **Elevated Administrator PowerShell**:
```powershell
Stop-Service MySQL80 -ErrorAction SilentlyContinue
sc.exe delete MySQL80
```

### Register a Local MySQL/MariaDB Binary as a Service
If you want your local database to start automatically on Windows boot:
```powershell
# Run PowerShell as Administrator:
& "C:\path\to\mysqld.exe" --install "MySQL" --defaults-file="C:\path\to\my.ini"

# Start the service:
Start-Service MySQL

# Verify it is running:
Get-Service MySQL
```

---

## 6. Verification & Health Checks

Use these commands to verify that your system is functioning normally:

### 1. Check Port 3306 Accessibility
```bash
# Windows (PowerShell):
Test-NetConnection -ComputerName localhost -Port 3306

# macOS / Linux:
nc -z 127.0.0.1 3306
```
*Expected Result:* TCP port is open and listening.

### 2. Verify Database Connection & InnoDB Engine Support
Test direct SQL connectivity and confirm that the InnoDB storage engine is available:
```bash
mysql -u root -h 127.0.0.1 -P 3306 -e "SELECT VERSION(); SHOW ENGINES;"
```
*(If your root user has a password, add `-p`)*

### 3. Verify API Health Endpoint
```bash
# PowerShell:
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health" | ConvertTo-Json

# Bash / curl:
curl -s http://localhost:3000/api/v1/health
```
*Expected Result:*
```json
{
  "status": "ok",
  "service": "RV Fitness Platform API",
  "database": "connected",
  "environment": "development"
}
```

### 4. Run Automated Vitest Test Suite
```bash
cd backend
npm test
```
*Expected Result:* **8 test suites passed (50 tests passing)** covering financial arithmetic, PDF receipts, and QR security.

---

## 7. Troubleshooting Matrix

| Issue | Root Cause | Universal Solution |
|:---|:---|:---|
| **`Error: P1001: Can't reach database server at localhost:3306`** | MySQL daemon is not running or port 3306 is closed. | Start your database (e.g. `docker compose up -d`, `Start-Service MySQL`, or start XAMPP). Verify with `Test-NetConnection -Port 3306` or `nc -z 127.0.0.1 3306`. |
| **`MySQL80 service fails to start: The system cannot find the file specified`** | Windows service points to a deleted path. | Delete the orphaned service with `sc.exe delete MySQL80` and use Docker or register the valid binary. |
| **`Error: Access denied for user 'root'@'localhost'`** | Password mismatch in `backend/.env`. | If using Docker/XAMPP, the default password is empty (`mysql://root:@localhost:3306/...`). If you installed MySQL Community Server with a password, provide it in `DATABASE_URL`. |
| **Prisma prompts: `Drift detected / We need to reset the database`** | Running `prisma migrate dev` on a database synchronized with `db push`. | **Do not agree to reset!** Type `n` to cancel and run `npm run db:push` (`npx prisma db push`). |
| **`Port 3000 already in use (EADDRINUSE)`** | An older backend Node process is still running. | Stop previous Node processes: Windows: `Get-Process node \| Stop-Process`, macOS/Linux: `pkill -f node`. Then re-run `npm run dev`. |
| **`Port 5173 already in use`** | Another Vite instance is running. | Vite will automatically offer port 5174, or you can stop older instances. |
| **Receipt PDF download fails / 404** | Member has no active membership plan or invalid receipt ID. | Assign an active membership plan to the member in Admin portal before issuing invoices. |
| **"Failed to load QR pass" on Member Card** | Backend API is stopped or database connection is offline. | Verify API health at `http://localhost:3000/api/v1/health` and verify member has an active membership assigned. |

---

## 8. Database Backup & Restore (MySQL / MariaDB)

For comprehensive backup strategies, point-in-time recovery, and cron scheduling, refer to the dedicated guide:  
👉 [`docs/BACKUP_RESTORE.md`](./BACKUP_RESTORE.md)

**Quick Manual Backup:**
```bash
# Windows PowerShell:
$date = Get-Date -Format "yyyyMMdd_HHmmss"
mysqldump -u root -h localhost -P 3306 --single-transaction --databases rvfitness_dev > "backups/rvfitness_backup_$date.sql"

# macOS / Linux:
mysqldump -u root -h localhost -P 3306 --single-transaction --databases rvfitness_dev > "backups/rvfitness_backup_$(date +%Y%m%d_%H%M%S).sql"
```

**Quick Restore:**
```bash
mysql -u root -h localhost -P 3306 rvfitness_dev < backups/rvfitness_backup_YYYYMMDD_HHMMSS.sql
```
*(Always use MySQL/MariaDB tools; never use PostgreSQL tools like `pg_dump`).*
