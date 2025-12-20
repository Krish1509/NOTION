# Vercel Environment Variables Setup Guide

This guide explains how to configure your environment variables on Vercel for production deployment.

## 📋 Required Environment Variables

Based on your project, you need to configure the following environment variables in Vercel:

### 1. Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 2. Convex Database
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment
```

### 3. Cloudflare R2 (Image Storage)
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your-public-domain.com
```

## 🚀 How to Add Environment Variables on Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to your project on Vercel**
   - Navigate to [vercel.com](https://vercel.com)
   - Select your project

2. **Open Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Variables**
   - Click **Add New**
   - Enter the **Key** (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - Enter the **Value** (your actual API key)
   - Select environments:
     - ✅ **Production** (for production deployments)
     - ✅ **Preview** (for preview deployments)
     - ✅ **Development** (optional, for local development)
   - Click **Save**

4. **Repeat for all variables**
   - Add each environment variable one by one
   - Make sure to add both `NEXT_PUBLIC_*` (public) and secret keys

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CONVEX_URL production
# ... repeat for all variables
```

## ⚠️ Important Notes

### Public vs Secret Variables
- **`NEXT_PUBLIC_*`** variables are exposed to the browser (safe for public keys)
- **Secret keys** (like `CLERK_SECRET_KEY`, `R2_SECRET_ACCESS_KEY`) should NEVER have `NEXT_PUBLIC_` prefix
- These secret keys are only available on the server-side

### Environment Selection
- **Production**: Used for production deployments
- **Preview**: Used for preview deployments (PR previews)
- **Development**: Used for local development (optional)

### After Adding Variables
1. **Redeploy your application** for changes to take effect
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger a new deployment

2. **Verify variables are loaded**
   - Check your application logs in Vercel
   - Ensure no "environment variable not found" errors

## 🔍 Quick Checklist

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` added
- [ ] `CLERK_SECRET_KEY` added
- [ ] `NEXT_PUBLIC_CONVEX_URL` added
- [ ] `CONVEX_DEPLOYMENT` added (if needed)
- [ ] `R2_ACCOUNT_ID` added
- [ ] `R2_ACCESS_KEY_ID` added
- [ ] `R2_SECRET_ACCESS_KEY` added
- [ ] `R2_BUCKET_NAME` added
- [ ] `R2_ENDPOINT` added (optional)
- [ ] `R2_PUBLIC_URL` added
- [ ] All variables set for **Production** environment
- [ ] Application redeployed after adding variables

## 🐛 Troubleshooting

### Variables not working?
1. Make sure you **redeployed** after adding variables
2. Check that variables are set for the correct environment (Production/Preview)
3. Verify variable names match exactly (case-sensitive)
4. Check Vercel deployment logs for errors

### Getting "undefined" for environment variables?
- Make sure `NEXT_PUBLIC_*` prefix is used for client-side variables
- Server-side variables (without `NEXT_PUBLIC_`) are only available in API routes and server components
- Restart your development server if testing locally

## 📚 Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

