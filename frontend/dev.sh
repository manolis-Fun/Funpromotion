#!/bin/bash

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "📦 Clearing node_modules cache..."
npm cache clean --force

echo "🚀 Starting development server with clean cache..."
npm run dev 