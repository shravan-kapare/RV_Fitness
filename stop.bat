@echo off
title Stop RV Fitness
cls
echo =====================================================================
echo                     STOP RV FITNESS PROCESSES
echo =====================================================================
echo.

echo Terminating Frontend & Backend Node processes...
taskkill /f /im node.exe >nul 2>&1
echo Done.

echo Terminating MySQL Server daemon...
taskkill /f /im mysqld.exe >nul 2>&1
echo Done.

echo.
echo All RV Fitness servers and databases have been stopped.
pause
