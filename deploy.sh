#!/bin/bash
# Deploy script for Cloudflare Pages + Worker
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying SAT Practice to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler..."
    npm install -g wrangler
fi

# Deploy AI Proxy Worker
echo "📦 Deploying AI Proxy Worker..."
wrangler deploy

# Get worker URL (you may need to set this manually)
WORKER_URL="https://satp-ai-proxy.YOUR_SUBDOMAIN.workers.dev"

echo "🔧 Worker URL: $WORKER_URL"
echo "⚠️  Update frontend/js/app.js with this URL:"
echo "   this.aiProxyUrl = '$WORKER_URL'"

# Deploy to Cloudflare Pages
echo "📦 Deploying Frontend to Cloudflare Pages..."
wrangler pages deploy frontend --project-name=sat-practice

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://sat-practice.pages.dev"
echo "🔧 Worker:   $WORKER_URL"