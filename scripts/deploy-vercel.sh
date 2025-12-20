#!/bin/bash

# Vercel Deployment Script
# This script helps you deploy to Vercel with all environment variables

set -e

echo "🚀 Vercel Deployment Setup"
echo "=========================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo ""
echo "📋 Setting up environment variables..."
echo ""

# Function to add environment variable
add_env_var() {
    local key=$1
    local description=$2
    local is_secret=$3
    
    echo "Enter value for $key ($description):"
    if [ "$is_secret" = "true" ]; then
        read -s value
        echo ""
    else
        read value
    fi
    
    if [ -n "$value" ]; then
        echo "Adding $key to Vercel..."
        echo "$value" | vercel env add "$key" production
        echo "$value" | vercel env add "$key" preview
        echo "✅ Added $key"
    else
        echo "⏭️  Skipping $key (empty value)"
    fi
    echo ""
}

# Add all required environment variables
echo "=== Clerk Authentication ==="
add_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk Publishable Key (pk_live_...)" false
add_env_var "CLERK_SECRET_KEY" "Clerk Secret Key (sk_live_...)" true

echo "=== Convex Database ==="
add_env_var "NEXT_PUBLIC_CONVEX_URL" "Convex URL (https://your-project.convex.cloud)" false

echo "=== Cloudflare R2 (Image Storage) ==="
add_env_var "R2_ACCOUNT_ID" "Cloudflare R2 Account ID" false
add_env_var "R2_ACCESS_KEY_ID" "R2 Access Key ID" false
add_env_var "R2_SECRET_ACCESS_KEY" "R2 Secret Access Key" true
add_env_var "R2_BUCKET_NAME" "R2 Bucket Name" false
add_env_var "R2_ENDPOINT" "R2 Endpoint URL (optional)" false
add_env_var "R2_PUBLIC_URL" "R2 Public URL for images" false

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Verify your deployment at: https://your-project.vercel.app"
echo "2. Check environment variables in Vercel Dashboard → Settings → Environment Variables"
echo "3. Test your application functionality"
echo ""

