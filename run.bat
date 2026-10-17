@echo off
setlocal EnableDelayedExpansion
title RV Fitness Launcher
cls
echo =====================================================================
echo                     RV FITNESS - APPLICATION LAUNCHER
echo =====================================================================
echo.

:: 1. Check if MySQL is running on port 3306
echo [1/3] Checking MySQL database service (port 3306)...
netstat -ano | findstr :3306 >nul 2>&1
if %errorlevel% equ 0 (
    echo       [OK] MySQL database is already active on port 3306.
) else (
    echo       [!] Port 3306 closed. Probing local database engines...
    set "MYSQL_BIN="
    set "MYSQL_INI="

    if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" (
        set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
    ) else if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" (
        set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
    ) else if exist "C:\xampp\mysql\bin\mysqld.exe" (
        set "MYSQL_BIN=C:\xampp\mysql\bin\mysqld.exe"
        set "MYSQL_INI=C:\xampp\mysql\bin\my.ini"
    ) else if exist "D:\xampp\mysql\bin\mysqld.exe" (
        set "MYSQL_BIN=D:\xampp\mysql\bin\mysqld.exe"
        set "MYSQL_INI=D:\xampp\mysql\bin\my.ini"
    ) else if exist "N:\cyber\mysql\bin\mysqld.exe" (
        set "MYSQL_BIN=N:\cyber\mysql\bin\mysqld.exe"
        set "MYSQL_INI=N:\cyber\mysql\bin\my.ini"
    )

    if defined MYSQL_BIN (
        echo       Starting database server: !MYSQL_BIN!
        if defined MYSQL_INI (
            start "RV Fitness - MySQL Server" /min "%MYSQL_BIN%" --defaults-file="%MYSQL_INI%" --console
        ) else (
            start "RV Fitness - MySQL Server" /min "%MYSQL_BIN%" --console
        )
        timeout /t 5 /nobreak >nul
    ) else (
        echo       WARNING: No local MySQL binary detected.
        echo       Please ensure MySQL is running (e.g. 'docker compose up -d' or Windows Service).
    )
)
echo.

:: 2. Start Backend API Server
echo [2/3] Starting Backend Express API on http://localhost:3000...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo       [OK] Backend server is already running on port 3000.
) else (
    start "RV Fitness - Backend API" cmd /k "cd /d %~dp0backend && npm run dev"
    timeout /t 3 /nobreak >nul
)
echo.

:: 3. Start Frontend Client
echo [3/3] Starting Frontend React App on http://localhost:5173...
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo       [OK] Frontend server is already running on port 5173.
) else (
    start "RV Fitness - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
    timeout /t 2 /nobreak >nul
)
echo.

:: 4. Open in default browser
echo =====================================================================
echo  RV Fitness is now LIVE!
echo =====================================================================
echo  Frontend URL : http://localhost:5173
echo  Backend API  : http://localhost:3000/api/v1/health
echo.
echo  Default Login Credentials:
echo   * Admin   : admin@rvfitness.com      / Admin@123456
echo   * Trainer : trainer@rvfitness.com    / Trainer@123456
echo   * Member  : rohit.shinde@example.com / Member@123456
echo =====================================================================
echo.
echo Launching http://localhost:5173 in your default browser...
start http://localhost:5173
