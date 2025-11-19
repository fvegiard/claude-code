#!/bin/bash

echo "================================================"
echo "🚀 MCP Workflow Orchestrator - Quick Setup"
echo "   Francis Végiard Architecture"
echo "================================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✓ Python3 found: $(python3 --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip install pyyaml --break-system-packages

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
else
    echo "⚠️  PyYAML install failed, trying alternative..."
    pip3 install pyyaml
fi

# Test installation
echo ""
echo "🧪 Testing orchestrator..."
python3 workflow_orchestrator.py workflows/simple-sequential.yaml > /tmp/test_output.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Orchestrator test PASSED"
    echo ""
    echo "================================================"
    echo "🎯 Setup Complete!"
    echo "================================================"
    echo ""
    echo "Quick Start:"
    echo "  python3 workflow_orchestrator.py workflows/simple-sequential.yaml"
    echo "  python3 workflow_orchestrator.py workflows/dashboard-electrique-mini.yaml"
    echo "  python3 workflow_orchestrator.py workflows/full-stack-dev-pipeline.yaml"
    echo ""
    echo "Documentation:"
    echo "  README.md - Complete guide"
    echo "  WORKFLOW-ORCHESTRATION.md - Architecture details"
    echo "  SUMMARY.md - Test results & comparison"
    echo ""
    echo "Visualizations:"
    echo "  architecture-francis-mcp.png - Architecture diagram"
    echo "  comparison-chart.png - vs Gemini 3 Pro"
    echo ""
else
    echo "❌ Test failed. Check /tmp/test_output.txt for details"
    exit 1
fi
