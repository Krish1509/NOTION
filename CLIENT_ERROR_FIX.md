# 🔧 Fix: Client-Side Error After Login

## Problem
- ✅ Login works
- ❌ After login, clicking pages shows: "Application error: a client-side exception has occurred"
- Data doesn't load until you click/interact

## Root Causes

### 1. Convex Dashboard Not Configured (Most Likely)
Convex needs to be configured to accept Clerk authentication.

### 2. Environment Variable Issue
`NEXT_PUBLIC_CONVEX_URL` might not be set correctly in Vercel.

### 3. Convex Client Initialization
Convex client might not be connecting properly.

## ✅ Fix Steps

### Step 1: Verify Vercel Environment Variable

1. Go to: https://vercel.com/krish1509s-projects/notion/settings/environment-variables
2. Check `NEXT_PUBLIC_CONVEX_URL`:
   - Should be: `https://fine-setter-221.convex.cloud`
   - Make sure it's set for **Production** and **Preview**
3. If missing or wrong, fix it and **Redeploy**

### Step 2: Configure Convex Dashboard (CRITICAL!)

**This is the most important step!**

1. **Go to Convex Dashboard:**
   https://dashboard.convex.dev

2. **Select deployment:** `fine-setter-221`

3. **Go to:** Settings → Auth

4. **Configure Clerk:**
   - **Auth Provider:** Select "Clerk"
   - **JWT Issuer URL:** `https://polished-clam-96.clerk.accounts.dev`
   - **Application ID:** `convex`
   - **Click Save**

### Step 3: Configure Clerk JWT Template

1. **Go to Clerk Dashboard:**
   https://dashboard.clerk.com

2. **Select your application**

3. **Go to:** JWT Templates

4. **Create/Edit Template:**
   - **Name:** `convex` (must match exactly!)
   - **Token Lifetime:** 3600 seconds
   - **Claims:**
     ```json
     {
       "sub": "{{user.id}}",
       "iss": "https://polished-clam-96.clerk.accounts.dev",
       "aud": "convex"
     }
     ```
   - **Save**

### Step 4: Redeploy Everything

```bash
# Redeploy Convex
npx convex deploy

# Then redeploy Vercel (or it will auto-deploy from GitHub)
```

### Step 5: Check Browser Console

1. Open your Vercel app
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors like:
   - "Convex connection failed"
   - "Authentication error"
   - "NEXT_PUBLIC_CONVEX_URL is not set"

## 🔍 Debugging

### Check Environment Variable in Browser

1. Open browser console (F12)
2. Type: `console.log(process.env.NEXT_PUBLIC_CONVEX_URL)`
3. Should show: `https://fine-setter-221.convex.cloud`
4. If it shows `undefined` or wrong URL, the environment variable isn't set correctly in Vercel

### Check Convex Connection

1. Open browser console
2. Look for Convex connection errors
3. Check Network tab for requests to `fine-setter-221.convex.cloud`
4. If requests are failing with 401/403, Convex auth isn't configured

## ✅ Verification Checklist

- [ ] `NEXT_PUBLIC_CONVEX_URL` is set correctly in Vercel
- [ ] Convex Dashboard → Settings → Auth → Clerk is configured
- [ ] Clerk Dashboard → JWT Template → "convex" template exists
- [ ] Convex redeployed: `npx convex deploy`
- [ ] Vercel app redeployed
- [ ] Browser console shows no errors
- [ ] Data loads after login without clicking

## 🎯 Expected Result

After fixing:
- ✅ Login works
- ✅ Data loads immediately after login
- ✅ No client-side errors
- ✅ All pages work without clicking

## 📝 Quick Test

After fixing, test this:
1. Logout
2. Login again
3. Dashboard should load data immediately
4. Click on different pages - all should work

If data still doesn't load, check the browser console for specific error messages.

