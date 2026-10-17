# RV FITNESS — Local Setup, Database Architecture & Troubleshooting Guide

**Platform:** RV Fitness Full-Stack Gym Management System  
**Target OS:** Windows 10 / 11 (PowerShell)  
**Database Engines:** MySQL 8.0+ or MariaDB 10.4+ (InnoDB Engine)  
**Backend:** Node.js 20+ (Express + TypeScript + Prisma ORM)  
**Frontend:** React 18 + TypeScript + Vite  

---

## 1. Executive Summary: What Runs Under the Hood

The RV Fitness application operates as a full-stack system communicating across three localhost services:

```
┌─────────────────────────────────┐
│     Frontend Client (Vite)      │  Port 5173 (http://localhost:5173)
│   React 18 + TypeScript + SPA   │
└────────────────┬────────────────┘
                 │ Proxy: /api/* -> :3000
                 ▼
┌─────────────────────────────────┐
│       Backend API Server        │  Port 3000 (http://localhost:3000)
│ Express + TypeScript + Prisma   │  Health: /api/v1/health
└────────────────┬────────────────┘
                 │ MySQL Connection (TCP)
                 ▼
┌─────────────────────────────────┐
│   Database Server (InnoDB)      │  Port 3306 (localhost:3306)
│   MariaDB 10.4.32 / MySQL 8.0+  │  Database: rvfitness_dev
└─────────────────────────────────┘
```

### Verified Local Instance Details
- **Active Database Engine:** MariaDB 10.4.32 (MySQL-compatible, x64 Windows binary distribution).
- **Physical Installation Path:** `N:\cyber\mysql` (XAMPP control suite).
- **Configuration File:** `N:\cyber\mysql\bin\my.ini`.
- **Active Data Directory:** `N:\cyber\mysql\data\rvfitness_dev`.
- **Database Connection URL:** `mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10` (default XAMPP root user has no password).
- **Schema Management Method:** Prisma Client + `prisma db push` (`npm run db:push`).

---

## 2. Why Manual `npx prisma migrate dev` Failed (Root Cause Analysis)

When developers run `npx prisma migrate dev` and encounter:
```text
Error: P1001: Can't reach database server at localhost:3306
```
alongside a stopped Windows Service `MySQL80`, here is exactly why:

### Root Cause 1: Orphaned Windows Service `MySQL80`
Windows `services.msc` lists a service named `MySQL80` registered with the path:
`"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"`
This executable does **not exist** on the filesystem (leftover registry entry from an older uninstalled MySQL installer). Because that service cannot start, relying on Windows to auto-start MySQL fails. The real database server resides in `N:\cyber\mysql\bin\mysqld.exe`.

### Root Cause 2: MySQL Server Was Not Launched
Prisma does not bundle an embedded database engine; it requires an active database listener on TCP port 3306. When `mysqld.exe` is not running, port 3306 is closed, triggering Prisma error `P1001`.

### Root Cause 3: Schema Synchronization Method (`db:push` vs `migrate dev`)
The RV Fitness database schema contains 30+ tables and custom enums (`schema.prisma` has 990+ lines).
- In development, the database schema was synchronized using **`prisma db push`** (`npm run db:push`).
- The `_prisma_migrations` tracking table was intentionally not used, and only an initial scaffold migration (`20261014072555_init_mysql`) exists in `backend/prisma/migrations`.
- **CRITICAL WARNING:** Running `prisma migrate dev` on a database with tables created via `prisma db push` will detect schema drift and prompt you to **reset the database** (`prisma migrate reset`), which will **permanently wipe all gym member, payment, and attendance records**. Always use `npm run db:push` in development.

---

## 3. Starting and Stopping the Application

To ensure smooth operation, the application services must be started in this exact order: **Database first, Backend second, Frontend third**.

### Option A: Manual Three-Terminal Sequence (Recommended)

#### **Terminal 1: Start Database Server (Port 3306)**
Start your database server first so port 3306 is open and accepting TCP connections:

```powershell
# Verified local setup (MariaDB 10.4.32 on N: drive):
& "N:\cyber\mysql\bin\mysqld.exe" --defaults-file="N:\cyber\mysql\bin\my.ini" --console

# (Alternatively, via XAMPP batch file:)
cd N:\cyber
.\mysql_start.bat
```
*Expected Output:*
```text
[Note] InnoDB: 10.4.32 started; log sequence number ...
[Note] Server socket created on IP: '::'.
[Note] N:\cyber\mysql\bin\mysqld.exe: ready for connections.
Version: '10.4.32-MariaDB'  port: 3306  mariadb.org binary distribution
```
*(Keep this terminal open while using the application)*

#### **Terminal 2: Start Backend Server (Port 3000)**
```powershell
cd I:\Antigravity\RV_Fitness\backend
npm run dev
```
*Expected Output:*
```text
✅ MySQL database connected successfully.
[2026-10-17 11:02:23] info: 🚀 RV Fitness Billing API is running on port 3000
[2026-10-17 11:02:23] info: 📋 API Health: http://localhost:3000/api/v1/health
```

#### **Terminal 3: Start Frontend Client (Port 5173)**
```powershell
cd I:\Antigravity\RV_Fitness\frontend
npm run dev
```
*Expected Output:*
```text
  VITE v8.3.4  ready in 766 ms
  ➜  Local:   http://localhost:5173/
```

---

### Option B: Automated Startup Helper (`start-dev.ps1`)

For convenience on Windows, you can run the repository startup script:
```powershell
cd I:\Antigravity\RV_Fitness
.\start-dev.ps1
```
**Safety Features of `start-dev.ps1`:**
1. Checks whether port 3306 is already listening before doing anything. If active, it skips database startup and never spawns duplicate instances.
2. If port 3306 is closed, it launches MariaDB in a visible terminal so errors are not hidden.
3. Launches backend and frontend in separate dedicated windows so dev logs and TypeScript compile errors remain visible.
4. Does not terminate existing processes without consent and never hardcodes credentials.

---

### Stopping the Application Safely

When finishing development work:
1. **Frontend:** Press `Ctrl + C` in Terminal 3 (or close the Vite window).
2. **Backend:** Press `Ctrl + C` in Terminal 2 (or close the Express window).
3. **Database:** Press `Ctrl + C` in Terminal 1 (or run `N:\cyber\mysql_stop.bat`).
   - MariaDB will perform an orderly shutdown, flush the InnoDB buffer pool, and exit cleanly:
     `[Note] N:\cyber\mysql\bin\mysqld.exe: Shutdown complete`.
   - *Never forcefully kill mysqld with `taskkill /F` unless it is completely unresponsive, to avoid InnoDB crash recovery on next boot.*

---

## 4. First-Time Setup on a New Developer Machine

Follow this reproducible checklist when setting up RV Fitness on a clean Windows machine:

### Step 1: Install Required Software
1. **Node.js:** v20.x or v22.x LTS ([nodejs.org](https://nodejs.org/))
2. **Git:** Windows Git ([git-scm.com](https://git-scm.com/))
3. **Database Server:** Either:
   - **MySQL Community Server 8.0+** ([dev.mysql.com](https://dev.mysql.com/downloads/mysql/)), OR
   - **XAMPP / MariaDB 10.4+** ([apachefriends.org](https://www.apachefriends.org/))

### Step 2: Clone Repository & Install Dependencies
```powershell
git clone https://github.com/shravan-kapare/RV_Fitness.git I:\Antigravity\RV_Fitness
cd I:\Antigravity\RV_Fitness

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ..\frontend
npm install
```

### Step 3: Configure Environment Variables
Copy the example configuration file:
```powershell
cd I:\Antigravity\RV_Fitness
Copy-Item .env.example backend\.env
```
Open `backend\.env` and configure your database connection string:
- **If using XAMPP / MariaDB (default root with no password):**
  ```env
  DATABASE_URL="mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:@localhost:3306/rvfitness_test?connection_limit=5"
  ```
- **If using standard MySQL 8.0 (with a root password):**
  ```env
  DATABASE_URL="mysql://root:YourRootPassword@localhost:3306/rvfitness_dev?connection_limit=10"
  DATABASE_URL_TEST="mysql://root:YourRootPassword@localhost:3306/rvfitness_test?connection_limit=5"
  ```

### Step 4: Create Database & Push Schema
1. Start your MySQL / MariaDB server.
2. Create the development and test databases if they do not exist:
   ```powershell
   # If using mysql CLI:
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS rvfitness_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS rvfitness_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
3. Generate Prisma client & synchronize schema:
   ```powershell
   cd I:\Antigravity\RV_Fitness\backend
   npm run db:generate
   npm run db:push
   ```
   > ⚠️ **DO NOT run `prisma migrate dev`** on an existing database, as it will prompt to drop existing tables. Always use `npm run db:push`.

### Step 5: Seed Admin Account & Demo Data
```powershell
# Create super-admin account (admin@rvfitness.com)
npm run db:seed-admin

# Seed membership plans, certified trainers, benefits catalog, and demo members
npm run db:seed
```

---

## 5. Fixing the Windows MySQL Service Problem

If you want Windows to automatically manage your MySQL/MariaDB service without manually keeping a terminal window open:

### Option A: Remove the Broken `MySQL80` Service Entry
The old `MySQL80` service points to a non-existent `C:\Program Files\...` path. Remove it using an **Elevated Administrator PowerShell**:
```powershell
# Run PowerShell as Administrator:
Stop-Service MySQL80 -ErrorAction SilentlyContinue
sc.exe delete MySQL80
```

### Option B: Register the Real MariaDB as a Windows Service
To run the existing MariaDB from `N:\cyber\mysql` as a background Windows service:
```powershell
# Run PowerShell as Administrator:
& "N:\cyber\mysql\bin\mysqld.exe" --install "MySQL" --defaults-file="N:\cyber\mysql\bin\my.ini"

# Start the newly registered service:
Start-Service MySQL

# Verify it is running:
Get-Service MySQL
```
Once registered, MariaDB will start automatically on Windows boot, and port 3306 will always be available.

---

## 6. Verification & Health Checks

Use these commands to verify that your system is functioning normally:

### 1. Check Port 3306 Accessibility
```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```
*Expected Result:* `TcpTestSucceeded : True`

### 2. Verify Database Connection & InnoDB Engine Support
Test direct SQL connectivity and confirm that the InnoDB storage engine is available:
```powershell
# Verified local setup (MariaDB on N: drive):
& "N:\cyber\mysql\bin\mysql.exe" -u root -h 127.0.0.1 -P 3306 -e "SELECT VERSION(); SHOW ENGINES;"

# Standard portable setup (if mysql is on PATH):
mysql -u root -h 127.0.0.1 -P 3306 -e "SELECT VERSION(); SHOW ENGINES;"
```
*Expected Output:*
```text
VERSION()
10.4.32-MariaDB
Engine    Support    Comment
...
InnoDB    DEFAULT    Supports transactions, row-level locking, foreign keys and encryption...
```

### 3. Verify API Health Endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health" | ConvertTo-Json
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

### 3. Run Automated Vitest Test Suite
```powershell
cd I:\Antigravity\RV_Fitness\backend
npm test
```
*Expected Result:* **8 test suites passed (50 tests passing)** covering financial arithmetic, PDF receipts, and QR security.

---

## 7. Troubleshooting Matrix

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`Error: P1001: Can't reach database server at localhost:3306`** | MySQL daemon is not running or port 3306 is closed. | Start MySQL using `& "N:\cyber\mysql\bin\mysqld.exe" --defaults-file="N:\cyber\mysql\bin\my.ini" --console` or start your Windows MySQL service. Check with `Test-NetConnection -Port 3306`. |
| **`MySQL80 service fails to start: The system cannot find the file specified`** | Windows service points to `C:\Program Files\MySQL\...` which doesn't exist. | Remove the orphaned service (`sc.exe delete MySQL80`) and register the real binary (`N:\cyber\mysql\bin\mysqld.exe --install`). |
| **`Error: Access denied for user 'root'@'localhost'`** | Password mismatch in `backend/.env`. | If using XAMPP/MariaDB, default password is blank (`mysql://root:@localhost:3306/...`). If MySQL 8.0, supply your set root password. |
| **Prisma prompts: `Drift detected / We need to reset the database`** | Running `prisma migrate dev` on a database synchronized with `db push`. | **Do not agree to reset!** Cancel the command and run `npm run db:push` (`npx prisma db push`). |
| **`Port 3000 already in use (EADDRINUSE)`** | An old backend Node process is still running. | Run `Get-Process -Name node \| Stop-Process` in PowerShell, then re-run `npm run dev`. |
| **`Port 5173 already in use`** | Another Vite instance is running. | Vite will automatically switch to port 5174, or stop the older process with `Get-Process node \| Stop-Process`. |
| **Receipt PDF download fails / 404** | Member has no active membership plan or invalid receipt ID. | Assign a membership plan to the member in Admin portal before issuing invoices. |
| **"Failed to load QR pass" on Member Card** | Backend API is stopped or database connection is offline. | Verify API health at `http://localhost:3000/api/v1/health` and verify member has an active membership assigned. |

---

## 8. Database Backup & Restore (MySQL / MariaDB)

For comprehensive backup strategies, point-in-time recovery, and cron scheduling, refer to the dedicated guide:  
👉 [`docs/BACKUP_RESTORE.md`](./BACKUP_RESTORE.md)

**Quick Manual Backup:**
```powershell
$date = Get-Date -Format "yyyyMMdd_HHmmss"
& "N:\cyber\mysql\bin\mysqldump.exe" -u root -h localhost -P 3306 --single-transaction --databases rvfitness_dev > "rvfitness_backup_$date.sql"
```

**Quick Restore:**
```powershell
& "N:\cyber\mysql\bin\mysql.exe" -u root -h localhost -P 3306 rvfitness_dev < "rvfitness_backup_YYYYMMDD_HHMMSS.sql"
```
*(Never use `pg_dump` or PostgreSQL tools; RV Fitness runs exclusively on MySQL/MariaDB InnoDB).*
