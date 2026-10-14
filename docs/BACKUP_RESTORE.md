# RV Fitness — MySQL Database Backup & Restoration Guide

## Overview

This guide documents standardized procedures for backing up and restoring the RV Fitness MySQL 8.0+ / MariaDB database (`rvfitness_dev`, `rvfitness_prod`). Regular automated backups and verified restore routines are critical for safeguarding financial transactions, invoices, receipts, and audit history.

All core tables use the **InnoDB** storage engine with `utf8mb4` character set.

---

## Prerequisites

- MySQL client binaries (`mysqldump`, `mysql`, `mysqlbinlog`) available on `PATH`.
- Database user with appropriate privileges (`SELECT`, `SHOW VIEW`, `RELOAD`, `LOCK TABLES`, `REPLICATION CLIENT` for backups; `ALL PRIVILEGES` on target database for restoration).
- Dedicated backup directory with secure file permissions (e.g., `D:\backups\rvfitness` on Windows or `/var/backups/rvfitness` on Linux).

---

## 1. Backup Procedures

### A. Full Consistent Online Backup (Recommended)

InnoDB supports online, non-blocking backups using `--single-transaction`. This creates an ACID-compliant point-in-time snapshot without interrupting gym staff operations.

```powershell
# Windows (PowerShell)
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "rvfitness_backup_${date}.sql"

mysqldump --host=localhost --port=3306 --user=root --password `
  --single-transaction `
  --quick `
  --routines `
  --triggers `
  --events `
  --hex-blob `
  --default-character-set=utf8mb4 `
  --databases rvfitness_dev > $backupFile

# Optional: Compress using PowerShell
Compress-Archive -Path $backupFile -DestinationPath "${backupFile}.zip"
Remove-Item $backupFile
```

```bash
# Linux / macOS
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h localhost -P 3306 -u root -p \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  --default-character-set=utf8mb4 \
  --databases rvfitness_dev | gzip > "rvfitness_backup_${DATE}.sql.gz"
```

### B. Schema-Only Backup

Useful for reviewing schema evolution and auditing constraints without copying sensitive financial data:

```powershell
mysqldump -h localhost -P 3306 -u root -p --no-data --routines --triggers rvfitness_dev > rvfitness_schema.sql
```

### C. Data-Only Backup

```powershell
mysqldump -h localhost -P 3306 -u root -p --no-create-info --single-transaction rvfitness_dev > rvfitness_data.sql
```

---

## 2. Automated Daily Backup Scripts

### Windows Scheduled Task Script (`scripts/backup-mysql.ps1`)

```powershell
# scripts/backup-mysql.ps1
param(
  [string]$DbName = "rvfitness_dev",
  [string]$DbUser = "root",
  [string]$DbPass = "",
  [string]$BackupDir = "I:\Antigravity\RV_Fitness\backups",
  [int]$RetentionDays = 30
)

if (!(Test-Path $BackupDir)) {
  New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

$date = Get-Date -Format "yyyyMMdd_HHmmss"
$sqlFile = Join-Path $BackupDir "${DbName}_${date}.sql"
$zipFile = "${sqlFile}.zip"

Write-Host "Starting backup of ${DbName} to ${sqlFile}..."

$dumpArgs = @(
  "--host=localhost",
  "--port=3306",
  "--user=$DbUser",
  "--single-transaction",
  "--quick",
  "--routines",
  "--triggers",
  "--hex-blob",
  "--default-character-set=utf8mb4",
  "--databases",
  $DbName
)

if ($DbPass -ne "") {
  $dumpArgs = @("--password=$DbPass") + $dumpArgs
}

& mysqldump $dumpArgs | Out-File -FilePath $sqlFile -Encoding utf8

if (Test-Path $sqlFile) {
  Compress-Archive -Path $sqlFile -DestinationPath $zipFile
  Remove-Item $sqlFile
  Write-Host "Backup successfully compressed to ${zipFile}"
}

# Purge backups older than retention period
$cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force
Write-Host "Retention purge complete."
```

### Linux Cron Job (`/etc/cron.daily/rvfitness-backup`)

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/rvfitness"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

mysqldump -h localhost -P 3306 -u root \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  --databases rvfitness_prod | gzip > "${BACKUP_DIR}/rvfitness_${DATE}.sql.gz"

chmod 600 "${BACKUP_DIR}/rvfitness_${DATE}.sql.gz"

# Retention cleanup
find "$BACKUP_DIR" -name "rvfitness_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete
```

---

## 3. Restoration Procedures

### A. Full Restoration to Existing or New Database

Before restoring, ensure the target database exists with `utf8mb4` character set:

```powershell
# 1. Create target database if it doesn't exist
mysql -h localhost -P 3306 -u root -e "CREATE DATABASE IF NOT EXISTS rvfitness_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Restore SQL dump (uncompressed)
mysql -h localhost -P 3306 -u root --default-character-set=utf8mb4 rvfitness_dev < rvfitness_backup_20261014.sql
```

```bash
# Linux restore from gzipped dump
gunzip < rvfitness_backup_20261014.sql.gz | mysql -h localhost -P 3306 -u root --default-character-set=utf8mb4 rvfitness_dev
```

### B. Clean-Slate Restoration (Recreate from Scratch)

```powershell
# Drop and recreate database
mysql -h localhost -P 3306 -u root -e "DROP DATABASE IF EXISTS rvfitness_dev; CREATE DATABASE rvfitness_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Replay backup
mysql -h localhost -P 3306 -u root --default-character-set=utf8mb4 rvfitness_dev < rvfitness_backup_20261014.sql
```

### C. Restoring into a Staging / Verification Database

Always verify backup integrity before relying on it:

```powershell
mysql -h localhost -P 3306 -u root -e "CREATE DATABASE IF NOT EXISTS rvfitness_verify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -h localhost -P 3306 -u root --default-character-set=utf8mb4 rvfitness_verify < rvfitness_backup_20261014.sql

# Run integrity query
mysql -h localhost -P 3306 -u root -e "SELECT COUNT(*) AS total_invoices FROM rvfitness_verify.invoices;"
```

---

## 4. Point-In-Time Recovery (PITR) via Binary Logs

To recover up to a specific transaction (e.g., recovering from accidental data modification):

1. **Verify Binary Logging is Enabled:**
   ```sql
   SHOW VARIABLES LIKE 'log_bin';
   ```
2. **Locate Relevant Binary Log Files:**
   ```sql
   SHOW BINARY LOGS;
   ```
3. **Restore Last Full mysqldump First.**
4. **Replay Binary Logs Up to the Incident Timestamp:**
   ```bash
   mysqlbinlog --stop-datetime="2026-10-14 14:30:00" mysql-bin.000001 mysql-bin.000002 | mysql -u root -p rvfitness_dev
   ```

---

## 5. Verification Checklist

After any restore procedure:

1. [ ] Check table count: `SHOW TABLES IN rvfitness_dev;` (must be 16 tables including `_prisma_migrations`).
2. [ ] Check row count of core tables: `invoices`, `payments`, `receipts`, `users`.
3. [ ] Verify financial ledger balances match:
   ```sql
   SELECT SUM(total_paisa) AS invoiced, SUM(paid_paisa) AS collected FROM rvfitness_dev.invoices;
   SELECT SUM(amount_paisa) AS total_payments FROM rvfitness_dev.payments WHERE status = 'CONFIRMED';
   ```
4. [ ] Check backend health endpoint: `GET http://localhost:3000/api/v1/health` returns `status: "ok"`, `database: "connected"`.
5. [ ] Run integration test suite: `npm test` passes cleanly.
