#!/bin/bash

###############################################################################
# Quebec Electrical System - Automated Setup Script
#
# This script automates the complete installation and setup process
# for the Quebec Electrical System with Claude Code CLI
#
# Author: F. Vegiard
# Version: 1.0.0
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    print_header "Quebec Electrical System - Setup"

    log_info "Starting automated setup..."
    echo ""

    # Step 1: Check prerequisites
    print_header "Step 1: Checking Prerequisites"

    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        log_success "Node.js installed: $NODE_VERSION"

        # Check version
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            log_warning "Node.js version 18+ recommended, you have $NODE_VERSION"
        fi
    else
        log_error "Node.js is not installed"
        log_info "Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi

    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        log_success "Python installed: $PYTHON_VERSION"
    else
        log_error "Python 3 is not installed"
        log_info "Please install Python 3.8+ from https://python.org"
        exit 1
    fi

    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log_success "npm installed: $NPM_VERSION"
    else
        log_error "npm is not installed"
        exit 1
    fi

    # Check pip
    if command_exists pip3; then
        PIP_VERSION=$(pip3 --version)
        log_success "pip installed: $PIP_VERSION"
    else
        log_error "pip3 is not installed"
        log_info "Please install pip3"
        exit 1
    fi

    # Check Claude CLI
    if command_exists claude; then
        CLAUDE_VERSION=$(claude --version 2>&1 || echo "unknown")
        log_success "Claude Code CLI installed: $CLAUDE_VERSION"
    else
        log_warning "Claude Code CLI not found"
        log_info "Installing Claude Code CLI globally..."
        npm install -g @anthropic-ai/claude-code-cli || {
            log_error "Failed to install Claude CLI"
            log_info "Please install manually: npm install -g @anthropic-ai/claude-code-cli"
            exit 1
        }
        log_success "Claude Code CLI installed successfully"
    fi

    echo ""

    # Step 2: Create directories
    print_header "Step 2: Creating Directories"

    mkdir -p storage/uploads
    mkdir -p storage/processed
    mkdir -p storage/exports
    mkdir -p backend/knowledge-base/faiss_index
    mkdir -p logs

    log_success "Directories created"

    # Step 3: Install Node.js dependencies
    print_header "Step 3: Installing Node.js Dependencies"

    # Backend
    log_info "Installing backend dependencies..."
    cd backend && npm install && cd ..
    log_success "Backend dependencies installed"

    # Electron app
    log_info "Installing Electron app dependencies..."
    cd electron-app && npm install && cd ..
    log_success "Electron app dependencies installed"

    # MCP Server
    log_info "Installing MCP server dependencies..."
    cd mcp-server-quebec-electrical && npm install && cd ..
    log_success "MCP server dependencies installed"

    echo ""

    # Step 4: Install Python dependencies
    print_header "Step 4: Installing Python Dependencies"

    # Check if virtual environment should be created
    read -p "Create Python virtual environment? (recommended) [y/N]: " CREATE_VENV

    if [[ $CREATE_VENV =~ ^[Yy]$ ]]; then
        log_info "Creating virtual environment..."
        python3 -m venv venv

        # Activate venv
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            source venv/Scripts/activate
        else
            source venv/bin/activate
        fi

        log_success "Virtual environment created and activated"
    fi

    log_info "Installing Python dependencies..."
    pip3 install -r backend/requirements.txt
    log_success "Python dependencies installed"

    echo ""

    # Step 5: Set permissions (Unix-like systems)
    if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
        print_header "Step 5: Setting Permissions"

        chmod +x scripts/deploy.sh 2>/dev/null || true
        chmod +x setup.sh 2>/dev/null || true
        chmod 755 storage 2>/dev/null || true

        log_success "Permissions set"
    fi

    echo ""

    # Step 6: Environment configuration
    print_header "Step 6: Environment Configuration"

    if [ ! -f ".env" ]; then
        log_info "Creating .env file from template..."

        cat > .env << 'EOF'
# Quebec Electrical System - Environment Configuration
# Created by setup script

# Application
NODE_ENV=development
PORT=3000

# Database (if using PostgreSQL in production)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=quebec_electrical
# DB_USER=postgres
# DB_PASSWORD=

# Redis (if using in production)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# File Upload
UPLOAD_DIR=./storage/uploads
MAX_FILE_SIZE=52428800

# Python Services
PYTHON_PATH=python3

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Security
# JWT_SECRET=your-secret-key-here
# SESSION_SECRET=your-session-secret-here

# Claude Code CLI (OAuth - no API key needed)
# Authentication handled via Claude CLI OAuth flow
EOF

        log_success ".env file created"
    else
        log_info ".env file already exists, skipping"
    fi

    echo ""

    # Step 7: Verify Claude CLI authentication
    print_header "Step 7: Claude CLI Authentication"

    log_info "Checking Claude CLI authentication status..."

    if claude auth status >/dev/null 2>&1; then
        log_success "Claude CLI is authenticated"
    else
        log_warning "Claude CLI is not authenticated"
        log_info "You will need to authenticate when you first launch the application"
        log_info "Or authenticate now by running: claude auth login"
    fi

    echo ""

    # Step 8: Build knowledge base (optional)
    print_header "Step 8: Knowledge Base Setup"

    read -p "Build FAISS knowledge base now? (requires Quebec electrical norms data) [y/N]: " BUILD_KB

    if [[ $BUILD_KB =~ ^[Yy]$ ]]; then
        log_info "Building knowledge base..."
        cd backend && python3 knowledge-base/faiss-manager.py build && cd ..
        log_success "Knowledge base built"
    else
        log_info "Skipping knowledge base build"
        log_info "You can build it later with: cd backend && python3 knowledge-base/faiss-manager.py build"
    fi

    echo ""

    # Final summary
    print_header "Setup Complete!"

    echo -e "${GREEN}✓${NC} All dependencies installed"
    echo -e "${GREEN}✓${NC} Directories created"
    echo -e "${GREEN}✓${NC} Environment configured"
    echo ""

    log_info "Next steps:"
    echo ""
    echo "  1. Review and update .env file if needed"
    echo "  2. Authenticate with Claude CLI (if not done):"
    echo "     ${YELLOW}claude auth login${NC}"
    echo ""
    echo "  3. Start the application:"
    echo "     ${YELLOW}./start.sh${NC}"
    echo "     ${YELLOW}# OR${NC}"
    echo "     ${YELLOW}cd electron-app && npm run dev${NC}"
    echo ""
    echo "  4. For production deployment:"
    echo "     ${YELLOW}./scripts/deploy.sh${NC}"
    echo ""

    log_success "Setup completed successfully!"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  - README.md - Project overview"
    echo "  - CLI_INSTALLATION.md - Detailed installation guide"
    echo "  - TESTING_GUIDE.md - Testing procedures"
    echo "  - USER_GUIDE.md - User documentation"
    echo ""
}

# Run main function
main "$@"
