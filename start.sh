#!/bin/bash

###############################################################################
# Quebec Electrical System - Quick Start Script
#
# Launches the Quebec Electrical System application with all required services
#
# Author: F. Vegiard
# Version: 1.0.0
###############################################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⚡ Quebec Electrical System - Starting...${NC}"
echo ""

# Check if setup has been run
if [ ! -d "node_modules" ] && [ ! -d "electron-app/node_modules" ]; then
    echo -e "${YELLOW}⚠ Dependencies not installed${NC}"
    echo -e "${BLUE}ℹ Running setup first...${NC}"
    ./setup.sh
    echo ""
fi

# Check Claude CLI
if ! command -v claude &> /dev/null; then
    echo -e "${RED}✗ Claude Code CLI not found${NC}"
    echo -e "${BLUE}ℹ Please install: npm install -g @anthropic-ai/claude-code-cli${NC}"
    exit 1
fi

# Check authentication
if ! claude auth status >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Claude CLI not authenticated${NC}"
    echo -e "${BLUE}ℹ You will be prompted to authenticate when the app starts${NC}"
    echo ""
fi

# Start the application
echo -e "${GREEN}✓${NC} Starting Electron application..."
echo -e "${BLUE}ℹ${NC} Application will open in a new window"
echo -e "${BLUE}ℹ${NC} Press Ctrl+C to stop"
echo ""

cd electron-app
npm start
