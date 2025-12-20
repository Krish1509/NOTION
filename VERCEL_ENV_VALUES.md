# 🔑 Environment Variables for Vercel (Production)

## ⚠️ IMPORTANT: Different from Local!

Your `.env.local` has **LOCAL/TEST** values. For Vercel production, you need **PRODUCTION** values.

## 📋 What to Put on Vercel

### 1. Clerk Keys - Use PRODUCTION Keys (NOT test keys!)

**In your `.env.local` (LOCAL):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**On Vercel (PRODUCTION):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  ← Use LIVE key!
CLERK_SECRET_KEY=sk_live_...                    ← Use LIVE key!
```

**How to get production keys:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. Switch to **Live** mode (not Test mode)
5. Copy the **Live** publishable key and secret key

### 2. Convex URL - Use PRODUCTION URL (NOT localhost!)

**In your `.env.local` (LOCAL):**
```
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210  ← This is LOCAL!
```

**On Vercel (PRODUCTION):**
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud  ← Production URL!
```

**How to get production URL:**
1. Deploy Convex to production:
   ```bash
   npx convex deploy
   ```
2. Copy the production URL (it will look like: `https://notion-f26f9.convex.cloud`)
3. Use that URL on Vercel

### 3. Convex Deployment (Optional)

**In your `.env.local` (LOCAL):**
```
CONVEX_DEPLOYMENT=local:local-krish1506soni-notion_f26f9
```

**On Vercel (PRODUCTION):**
```
CONVEX_DEPLOYMENT=prod:your-production-deployment
```
OR you can skip this - Convex will auto-detect it from the URL.

### 4. Cloudflare R2 (If you use image uploads)

If you have R2 variables in your `.env.local`, you can use the **SAME** values on Vercel:
- `R2_ACCOUNT_ID` - Same
- `R2_ACCESS_KEY_ID` - Same
- `R2_SECRET_ACCESS_KEY` - Same
- `R2_BUCKET_NAME` - Same
- `R2_ENDPOINT` - Same
- `R2_PUBLIC_URL` - Same

## ✅ Quick Checklist for Vercel

Add these to Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...` (NOT pk_test_)
- [ ] `CLERK_SECRET_KEY` = `sk_live_...` (NOT sk_test_)
- [ ] `NEXT_PUBLIC_CONVEX_URL` = `https://your-project.convex.cloud` (NOT localhost)
- [ ] (Optional) `CONVEX_DEPLOYMENT` = `prod:...`
- [ ] (If using R2) All R2 variables - same as local

## 🚀 Steps to Deploy

1. **Get Production Convex URL:**
   ```bash
   npx convex deploy
   ```
   Copy the URL it gives you.

2. **Get Production Clerk Keys:**
   - Go to Clerk Dashboard → Switch to Live mode
   - Copy Live keys

3. **Add to Vercel:**
   - Go to: https://vercel.com/krish1509s-projects/notion/settings/environment-variables
   - Add each variable
   - Select **Production** and **Preview** environments

4. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy"

## 📝 Summary

| Variable | Local (.env.local) | Vercel (Production) |
|----------|-------------------|---------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` ✅ |
| `CLERK_SECRET_KEY` | `sk_test_...` | `sk_live_...` ✅ |
| `NEXT_PUBLIC_CONVEX_URL` | `http://127.0.0.1:3210` | `https://...convex.cloud` ✅ |
| `CONVEX_DEPLOYMENT` | `local:...` | `prod:...` (optional) |
| R2 variables | (your values) | Same values ✅ |

**Remember: Test keys and localhost URLs won't work in production!**

