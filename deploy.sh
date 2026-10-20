#!/bin/bash
# Deploy script for Cloudflare Pages
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying SAT Practice to Cloudflare Pages..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler..."
    npm install -g wrangler
fi

# Deploy to Cloudflare Pages
echo "📦 Building and deploying..."
wrangler pages deploy frontend --project-name=sat-practice

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://sat-practice.pages.dev"