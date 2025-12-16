#!/bin/bash
# Quick script to configure Convex auth via dashboard config

echo "🔐 Setting up Convex Authentication with Clerk"
echo ""
echo "Your Clerk domain: https://polished-clam-96.clerk.accounts.dev"
echo ""
echo "⚠️  You need to configure this in Convex Dashboard:"
echo ""
echo "1. Switch to 'archlinux Port 3210' deployment"
echo "2. Go to Settings → Authentication"
echo "3. Add Clerk provider with:"
echo ""
echo "   Domain: https://polished-clam-96.clerk.accounts.dev"
echo "   JWKS:   https://polished-clam-96.clerk.accounts.dev/.well-known/jwks.json"
echo ""
echo "📋 Or look for a JSON config field and paste:"
echo ""
cat << 'EOF'
{
  "providers": [
    {
      "domain": "https://polished-clam-96.clerk.accounts.dev",
      "applicationID": "convex"
    }
  ]
}
EOF
echo ""
echo "Then restart: npx convex dev && npm run dev"

