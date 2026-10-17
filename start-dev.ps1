<#
.SYNOPSIS
    RV Fitness — Universal Development Environment Starter (Windows)

.DESCRIPTION
    Safely starts the RV Fitness full-stack development environment on any Windows laptop:
    1. Checks if MySQL/MariaDB is already listening on port 3306.
       - If already running (e.g. via Docker, Windows Service, or XAMPP), reuses the existing instance.
       - If not running, auto-detects MySQL / MariaDB from standard paths (or Docker) and starts it.
    2. Launches the backend Express API server in a dedicated window.
    3. Launches the frontend Vite development server in a dedicated window.
    
    Safety rules:
    - Never launches duplicate database instances if port 3306 is already open.
    - Never terminates existing database or application processes without consent.
    - Leaves terminal windows open so all build and runtime logs remain visible.
    - Universal: works on any drive or directory without hardcoded absolute paths.
#>

[CmdletBinding()]
param (
    [string]$MysqlPath = "",
    [string]$MysqlIni = "",
    [switch]$SkipDb
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "         RV FITNESS -- DEVELOPMENT STARTUP ORCHESTRATOR    " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

$rootPath = $PSScriptRoot
$backendPath = Join-Path $rootPath "backend"
$frontendPath = Join-Path $rootPath "frontend"

# -----------------------------------------------------------------------------
# 1. Database Check & Startup (Port 3306)
# -----------------------------------------------------------------------------
Write-Host "[1/3] Checking Database connectivity on localhost:3306..." -ForegroundColor Cyan

$dbConnection = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue

if ($dbConnection.TcpTestSucceeded) {
    Write-Host "  [OK] Database listener is ALREADY ACTIVE on port 3306." -ForegroundColor Green
    Write-Host "       Reusing existing database instance (no duplicate process launched)." -ForegroundColor Gray
} elseif ($SkipDb) {
    Write-Host "  [-] -SkipDb flag specified. Skipping local database launcher." -ForegroundColor Yellow
} else {
    Write-Host "  [!] Port 3306 is closed. Attempting auto-detection of MySQL / MariaDB..." -ForegroundColor Yellow
    
    $resolvedMysqlBin = $null
    $resolvedMysqlIni = $null

    # 1. Check user-supplied path
    if ($MysqlPath -ne "" -and (Test-Path $MysqlPath)) {
        $resolvedMysqlBin = $MysqlPath
        if ($MysqlIni -ne "" -and (Test-Path $MysqlIni)) { $resolvedMysqlIni = $MysqlIni }
    }

    # 2. Check system PATH
    if (-not $resolvedMysqlBin) {
        $cmdPath = (Get-Command mysqld -ErrorAction SilentlyContinue | Select-Object -First 1).Source
        if ($cmdPath -and (Test-Path $cmdPath)) {
            $resolvedMysqlBin = $cmdPath
        }
    }

    # 3. Check standard Windows installation paths
    if (-not $resolvedMysqlBin) {
        $standardPaths = @(
            "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe",
            "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe",
            "C:\xampp\mysql\bin\mysqld.exe",
            "D:\xampp\mysql\bin\mysqld.exe",
            "N:\cyber\mysql\bin\mysqld.exe"
        )
        foreach ($p in $standardPaths) {
            if (Test-Path $p) {
                $resolvedMysqlBin = $p
                break
            }
        }
    }

    # 4. Check MariaDB Program Files wildcard
    if (-not $resolvedMysqlBin) {
        $mariaDbMatch = Get-ChildItem -Path "C:\Program Files\MariaDB*" -Filter "mysqld.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($mariaDbMatch) {
            $resolvedMysqlBin = $mariaDbMatch.FullName
        }
    }

    # If binary found, locate my.ini if not already set
    if ($resolvedMysqlBin) {
        if (-not $resolvedMysqlIni) {
            $binDir = Split-Path -Parent $resolvedMysqlBin
            $parentDir = Split-Path -Parent $binDir
            $candidateInis = @(
                (Join-Path $binDir "my.ini"),
                (Join-Path $parentDir "my.ini")
            )
            foreach ($ini in $candidateInis) {
                if (Test-Path $ini) {
                    $resolvedMysqlIni = $ini
                    break
                }
            }
        }

        Write-Host "      Found database server at: $resolvedMysqlBin" -ForegroundColor Gray
        $cmdArgs = if ($resolvedMysqlIni) {
            "Write-Host 'Starting Database server on port 3306...' -ForegroundColor Cyan; & '$resolvedMysqlBin' --defaults-file='$resolvedMysqlIni' --console"
        } else {
            "Write-Host 'Starting Database server on port 3306...' -ForegroundColor Cyan; & '$resolvedMysqlBin' --console"
        }

        Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdArgs
        
        Write-Host "      Waiting for port 3306 to become ready..." -NoNewline
        $retryCount = 0
        $ready = $false
        while ($retryCount -lt 12) {
            Start-Sleep -Seconds 1
            $check = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
            if ($check.TcpTestSucceeded) {
                $ready = $true
                break
            }
            Write-Host "." -NoNewline
            $retryCount++
        }
        Write-Host ""
        
        if ($ready) {
            Write-Host "  [OK] Database server started successfully on port 3306." -ForegroundColor Green
        } else {
            Write-Host "  [!] Warning: Port 3306 did not respond within 12 seconds." -ForegroundColor Red
            Write-Host "      Check the database console window for error messages." -ForegroundColor Red
        }
    } else {
        # Check if Docker is installed
        $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
        Write-Host "  [!] No local MySQL binary found in standard locations." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Please start your database using one of these options:" -ForegroundColor White
        if ($dockerCmd) {
            Write-Host "    * Option 1 (Docker): Run 'docker compose up -d' in the project root" -ForegroundColor Green
        } else {
            Write-Host "    * Option 1 (Docker): Install Docker Desktop and run 'docker compose up -d'" -ForegroundColor Gray
        }
        Write-Host "    * Option 2 (Windows Service): Start-Service MySQL (or via services.msc)" -ForegroundColor Gray
        Write-Host "    * Option 3 (XAMPP): Start MySQL from the XAMPP Control Panel" -ForegroundColor Gray
        Write-Host "    * Option 4 (Custom): .\start-dev.ps1 -MysqlPath 'C:\path\to\mysqld.exe'" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host ""

# -----------------------------------------------------------------------------
# 2. Backend Startup (Port 3000)
# -----------------------------------------------------------------------------
Write-Host "[2/3] Launching Backend API server (Port 3000)..." -ForegroundColor Cyan
if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting RV Fitness Backend (Express)...' -ForegroundColor Cyan; npm run dev"
    Write-Host "  [OK] Backend terminal launched." -ForegroundColor Green
} else {
    Write-Host "  [X] Error: Backend directory not found at $backendPath" -ForegroundColor Red
}

Write-Host ""

# -----------------------------------------------------------------------------
# 3. Frontend Startup (Port 5173)
# -----------------------------------------------------------------------------
Write-Host "[3/3] Launching Frontend application (Port 5173)..." -ForegroundColor Cyan
if (Test-Path $frontendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Starting RV Fitness Frontend (Vite)...' -ForegroundColor Cyan; npm run dev"
    Write-Host "  [OK] Frontend terminal launched." -ForegroundColor Green
} else {
    Write-Host "  [X] Error: Frontend directory not found at $frontendPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         RV FITNESS PLATFORM IS STARTING UP!             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor White
Write-Host "  * Public Homepage : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  * Portal Login    : http://localhost:5173/login" -ForegroundColor Cyan
Write-Host "  * Backend API     : http://localhost:3000" -ForegroundColor Cyan
Write-Host "  * API Health Check: http://localhost:3000/api/v1/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Demo Credentials:" -ForegroundColor White
Write-Host "  * Admin   : admin@rvfitness.com      / Admin@123456" -ForegroundColor Gray
Write-Host "  * Trainer : trainer@rvfitness.com    / Trainer@123456" -ForegroundColor Gray
Write-Host "  * Member  : rohit.shinde@example.com / Member@123456" -ForegroundColor Gray
Write-Host ""
Write-Host "Tip: Keep the spawned terminal windows open during development." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
