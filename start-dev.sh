#!/usr/bin/env bash
# ==============================================================================
# RV Fitness — Universal Development Environment Starter (macOS & Linux)
# ==============================================================================

set -e

# Terminal colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

echo -e "${YELLOW}==========================================================${NC}"
echo -e "${YELLOW}         RV FITNESS -- DEVELOPMENT STARTUP ORCHESTRATOR    ${NC}"
echo -e "${YELLOW}==========================================================${NC}"
echo ""

# ------------------------------------------------------------------------------
# 1. Database Check (Port 3306)
# ------------------------------------------------------------------------------
echo -e "${CYAN}[1/3] Checking Database connectivity on localhost:3306...${NC}"

check_port() {
  if command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 3306 >/dev/null 2>&1
  elif command -v lsof >/dev/null 2>&1; then
    lsof -i :3306 >/dev/null 2>&1
  else
    (echo > /dev/tcp/127.0.0.1/3306) >/dev/null 2>&1
  fi
}

if check_port; then
  echo -e "  ${GREEN}[OK] Database listener is ALREADY ACTIVE on port 3306.${NC}"
else
  echo -e "  ${YELLOW}[!] Port 3306 is closed.${NC}"
  if command -v docker >/dev/null 2>&1; then
    echo -e "      ${GREEN}[i] Starting MySQL container via Docker Compose...${NC}"
    docker compose up -d
    echo -e "      Waiting for MySQL to accept connections..."
    RETRIES=15
    until check_port || [ $RETRIES -eq 0 ]; do
      echo -n "."
      sleep 1
      RETRIES=$((RETRIES - 1))
    done
    echo ""
    if check_port; then
      echo -e "  ${GREEN}[OK] Docker MySQL started successfully on port 3306.${NC}"
    else
      echo -e "  ${RED}[!] MySQL container started, but port 3306 is not ready yet.${NC}"
    fi
  else
    echo -e "  ${RED}[!] MySQL is not running on port 3306.${NC}"
    echo -e "      Please start your database using one of these options:"
    echo -e "      - Docker (Recommended): docker compose up -d"
    echo -e "      - macOS Homebrew: brew services start mysql"
    echo -e "      - Linux systemd: sudo systemctl start mysql"
  fi
fi

echo ""

# ------------------------------------------------------------------------------
# 2. Backend & Frontend Startup
# ------------------------------------------------------------------------------
echo -e "${CYAN}[2/3] Launching Backend API server (Port 3000)...${NC}"
cd "${BACKEND_DIR}"
npm run dev &
BACKEND_PID=$!
echo -e "  ${GREEN}[OK] Backend process started (PID: ${BACKEND_PID}).${NC}"

echo ""
echo -e "${CYAN}[3/3] Launching Frontend application (Port 5173)...${NC}"
cd "${FRONTEND_DIR}"
npm run dev &
FRONTEND_PID=$!
echo -e "  ${GREEN}[OK] Frontend process started (PID: ${FRONTEND_PID}).${NC}"

echo ""
echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}         RV FITNESS PLATFORM IS STARTING UP!             ${NC}"
echo -e "${GREEN}==========================================================${NC}"
echo ""
echo -e "Access Points:"
echo -e "  * Public Homepage : ${CYAN}http://localhost:5173${NC}"
echo -e "  * Portal Login    : ${CYAN}http://localhost:5173/login${NC}"
echo -e "  * Backend API     : ${CYAN}http://localhost:3000${NC}"
echo -e "  * API Health Check: ${CYAN}http://localhost:3000/api/v1/health${NC}"
echo ""
echo -e "Default Demo Credentials:"
echo -e "  * Admin   : admin@rvfitness.com      / Admin@123456"
echo -e "  * Trainer : trainer@rvfitness.com    / Trainer@123456"
echo -e "  * Member  : rohit.shinde@example.com / Member@123456"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop backend and frontend services.${NC}"

# Handle graceful shutdown on Ctrl+C
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping services...${NC}"
  kill "${BACKEND_PID}" 2>/dev/null || true
  kill "${FRONTEND_PID}" 2>/dev/null || true
  echo -e "${GREEN}Services stopped.${NC}"
  exit 0
}

trap cleanup INT TERM
wait
