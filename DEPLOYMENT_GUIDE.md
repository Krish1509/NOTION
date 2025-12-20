# 🚀 Complete Vercel Deployment Guide

This guide will help you deploy your Notion CRM application to Vercel with all necessary configurations.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Clerk Account**: Get API keys from [dashboard.clerk.com](https://dashboard.clerk.com)
3. **Convex Account**: Deploy your Convex backend at [dashboard.convex.dev](https://dashboard.convex.dev)
4. **Cloudflare R2** (Optional): For image storage at [dash.cloudflare.com](https://dash.cloudflare.com)

## 🎯 Quick Deployment (Automated)

### Option 1: Using the Setup Script (Recommended)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Run the automated setup script
npm run vercel:setup

# Deploy to production
npm run vercel:deploy
```

Or do both in one command:
```bash
npm run deploy:all
```

### Option 2: Manual Setup via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import project on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from the list below

4. **Deploy**
   - Click "Deploy" or push to main branch (auto-deploys)

## 🔑 Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**How to get:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to API Keys
4. Copy Publishable Key and Secret Key (use Live keys for production)

### Convex Database
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

**How to get:**
1. Deploy Convex: `npx convex deploy`
2. Copy the deployment URL from Convex Dashboard
3. Use production URL (not localhost)

### Cloudflare R2 (Image Storage) - Optional
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your-public-domain.com
```

**How to get:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 → Manage R2 API Tokens
3. Create API token with read/write permissions
4. Create a bucket and get its name
5. Set up a custom domain for public access (optional)

## 📝 Step-by-Step Deployment

### Step 1: Deploy Convex Backend

```bash
# Login to Convex
npx convex login

# Deploy to production
npx convex deploy

# Copy the production URL (e.g., https://your-project.convex.cloud)
```

### Step 2: Set Up Vercel Project

#### Via CLI (Recommended):
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Set up environment variables
npm run vercel:setup
```

#### Via Dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework Preset: Next.js (auto-detected)
4. Root Directory: `./` (default)
5. Build Command: `npm run build` (default)
6. Output Directory: `.next` (default)
7. Install Command: `npm install` (default)

### Step 3: Configure Environment Variables

#### Using the Script:
```bash
npm run vercel:setup
```

This will:
- Check if Vercel CLI is installed
- Verify you're logged in
- Optionally load values from `.env.local`
- Prompt for each environment variable
- Add them to Vercel (Production + Preview)

#### Manual Configuration:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - **Value**: Your actual API key
   - **Environment**: Select Production, Preview, and Development
3. Click "Save"

### Step 4: Deploy

#### Automatic Deployment:
- Push to `main` branch → Vercel auto-deploys

#### Manual Deployment:
```bash
# Deploy to production
npm run vercel:deploy

# Or preview deployment
npm run vercel:preview
```

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Application is accessible at `https://your-project.vercel.app`
- [ ] Login page loads correctly
- [ ] Can login with manager credentials
- [ ] Dashboard loads after login
- [ ] Image upload works (if R2 configured)
- [ ] Chat functionality works
- [ ] Sticky notes work
- [ ] No console errors in browser
- [ ] Check Vercel deployment logs for errors

## 🐛 Troubleshooting

### Build Fails

**Error: Environment variable not found**
- Solution: Add missing variables in Vercel Dashboard → Settings → Environment Variables
- Redeploy after adding variables

**Error: Module not found**
- Solution: Check `package.json` dependencies
- Run `npm install` locally to verify

### Runtime Errors

**Error: Clerk authentication fails**
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are correct
- Verify you're using production keys (not test keys)
- Check Clerk Dashboard → Settings → Domains → Add your Vercel domain

**Error: Convex connection fails**
- Verify `NEXT_PUBLIC_CONVEX_URL` is production URL (not localhost)
- Check Convex deployment is active
- Verify Convex auth configuration matches Clerk

**Error: Image upload fails**
- Check all R2 environment variables are set
- Verify R2 bucket exists and is accessible
- Check R2 API token has correct permissions

### Deployment Not Updating

1. **Clear Vercel cache**: Settings → Clear Build Cache
2. **Redeploy**: Deployments → Redeploy
3. **Check build logs**: Look for errors in deployment logs

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Clerk Production Guide](https://clerk.com/docs/deployments/overview)
- [Convex Deployment](https://docs.convex.dev/deploy/deployments)

## 🎉 Post-Deployment

After successful deployment:

1. **Update Clerk Allowed Domains**
   - Go to Clerk Dashboard → Settings → Domains
   - Add your Vercel domain: `your-project.vercel.app`

2. **Test All Features**
   - Login/Logout
   - User management (if manager)
   - Image uploads
   - Chat functionality
   - Sticky notes

3. **Set Up Custom Domain** (Optional)
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

4. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor error logs
   - Set up alerts if needed

## 🔒 Security Notes

- ✅ Never commit `.env.local` to Git (already in `.gitignore`)
- ✅ Use production API keys (not test keys) for production
- ✅ Keep secret keys secure
- ✅ Regularly rotate API keys
- ✅ Use environment-specific variables (Production vs Preview)

---

**Need Help?** Check the [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) for detailed environment variable setup.

