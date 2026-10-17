<#
.SYNOPSIS
    RV Fitness — Windows Development Environment Starter

.DESCRIPTION
    Safely starts the RV Fitness full-stack development environment:
    1. Checks if MySQL/MariaDB is already listening on port 3306.
       - If not running, launches the verified local MariaDB daemon in a dedicated window.
    2. Launches the backend Express API server in a dedicated window.
    3. Launches the frontend Vite development server in a dedicated window.
    
    Adheres to safety requirements:
    - Never launches duplicate database instances if port 3306 is already open.
    - Never terminates existing database or application processes without consent.
    - Leaves terminal windows open so all build and runtime logs remain visible.
    - Never hardcodes passwords.
#>

[CmdletBinding()]
param (
    [string]$MysqlPath = "N:\cyber\mysql\bin\mysqld.exe",
    [string]$MysqlIni = "N:\cyber\mysql\bin\my.ini"
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
} else {
    Write-Host "  [!] Port 3306 is closed. Attempting to start local MariaDB..." -ForegroundColor Yellow
    
    if (Test-Path $MysqlPath) {
        Write-Host "      Found MariaDB binary at: $MysqlPath" -ForegroundColor Gray
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting MariaDB on port 3306...' -ForegroundColor Cyan; & '$MysqlPath' --defaults-file='$MysqlIni' --console"
        
        Write-Host "      Waiting for port 3306 to become ready..." -NoNewline
        $retryCount = 0
        $ready = $false
        while ($retryCount -lt 10) {
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
            Write-Host "  [OK] MariaDB started successfully on port 3306." -ForegroundColor Green
        } else {
            Write-Host "  [!] Warning: Port 3306 did not respond within 10 seconds." -ForegroundColor Red
            Write-Host "      Check the MariaDB terminal window for startup errors." -ForegroundColor Red
        }
    } else {
        Write-Host "  [!] Local MariaDB executable not found at: $MysqlPath" -ForegroundColor Red
        Write-Host "      Please start your MySQL/MariaDB server manually on port 3306 before proceeding." -ForegroundColor Red
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
Write-Host " Application starting! Access points:" -ForegroundColor Green
Write-Host "   * Public Website & Member Portal: http://localhost:5173" -ForegroundColor White
Write-Host "   * Portal Login:                   http://localhost:5173/login" -ForegroundColor White
Write-Host "   * Backend REST API:               http://localhost:3000/api/v1/health" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Note: Keep all 3 service terminal windows open while developing." -ForegroundColor Gray
