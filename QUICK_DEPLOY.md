# ⚡ Quick Deploy to Vercel

## 🚀 Fastest Way to Deploy

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Up Environment Variables (Automated)
```bash
npm run vercel:setup
```

This script will:
- ✅ Check Vercel CLI installation
- ✅ Verify you're logged in
- ✅ Optionally load from `.env.local`
- ✅ Prompt for all required API keys
- ✅ Add them to Vercel automatically

### 4. Deploy
```bash
npm run vercel:deploy
```

**OR** push to GitHub main branch (auto-deploys):
```bash
git push origin main
```

## 📋 What You'll Need

When running `npm run vercel:setup`, have these ready:

1. **Clerk Keys** (from [dashboard.clerk.com](https://dashboard.clerk.com))
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_...)
   - `CLERK_SECRET_KEY` (sk_live_...)

2. **Convex URL** (after `npx convex deploy`)
   - `NEXT_PUBLIC_CONVEX_URL` (https://your-project.convex.cloud)

3. **Cloudflare R2** (optional, for images)
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_ENDPOINT` (optional)
   - `R2_PUBLIC_URL`

## 🎯 One-Command Deploy

If you already have `.env.local` with all values:
```bash
npm run deploy:all
```

This will:
1. Set up all environment variables from `.env.local`
2. Deploy to Vercel production

## ✅ After Deployment

1. **Add Vercel domain to Clerk**
   - Clerk Dashboard → Settings → Domains
   - Add: `your-project.vercel.app`

2. **Test your app**
   - Visit: `https://your-project.vercel.app`
   - Login and test all features

## 📚 Need More Help?

- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
- See [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) for environment variables guide

