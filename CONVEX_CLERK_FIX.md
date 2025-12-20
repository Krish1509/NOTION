# 🔧 Fix: Convex Data Not Loading (Clerk Working)

## Problem
- ✅ Clerk authentication works
- ❌ Convex data doesn't load
- Error: Client-side exception

## Root Cause
Convex needs to be configured in the **Convex Dashboard** to accept Clerk authentication tokens.

## ✅ Fix Steps

### Step 1: Configure Convex Dashboard

1. **Go to Convex Dashboard:**
   https://dashboard.convex.dev

2. **Select your deployment:** `fine-setter-221`

3. **Go to Settings → Auth**

4. **Configure Clerk Authentication:**
   - **Auth Provider:** Select "Clerk"
   - **JWT Issuer URL:** `https://polished-clam-96.clerk.accounts.dev`
   - **Application ID:** `convex`
   - **Save**

### Step 2: Configure Clerk JWT Template

1. **Go to Clerk Dashboard:**
   https://dashboard.clerk.com

2. **Select your application**

3. **Go to:** JWT Templates → Create or Edit

4. **Create/Edit JWT Template:**
   - **Name:** `convex` (must match `applicationID` in Convex)
   - **Token Lifetime:** 3600 seconds (1 hour)
   - **Claims:**
     ```json
     {
       "sub": "{{user.id}}",
       "iss": "https://polished-clam-96.clerk.accounts.dev",
       "aud": "convex"
     }
     ```
   - **Save**

### Step 3: Verify Convex Auth Config

Your `convex/auth.config.ts` should have:
```typescript
export default {
  providers: [
    {
      domain: "https://polished-clam-96.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

✅ This looks correct already!

### Step 4: Redeploy Convex

After configuring in Convex Dashboard:

```bash
npx convex deploy
```

### Step 5: Verify Environment Variables

Make sure in Vercel you have:
- ✅ `NEXT_PUBLIC_CONVEX_URL` = `https://fine-setter-221.convex.cloud`
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = Your Clerk key
- ✅ `CLERK_SECRET_KEY` = Your Clerk secret

### Step 6: Check Browser Console

Open browser console (F12) and check for errors:
- Look for Convex connection errors
- Check if Clerk tokens are being sent to Convex

## 🔍 Troubleshooting

### If still not working:

1. **Check Convex Dashboard → Logs:**
   - Look for authentication errors
   - Check if requests are reaching Convex

2. **Verify Clerk Domain:**
   - Make sure the domain in `convex/auth.config.ts` matches your Clerk instance
   - Check Clerk Dashboard → Settings → Domains

3. **Check CORS:**
   - Convex should allow requests from your Vercel domain
   - This is usually automatic, but check if needed

4. **Test Connection:**
   - Visit: `https://fine-setter-221.convex.cloud`
   - Should show "This Convex deployment is running"

## 📝 Quick Checklist

- [ ] Convex Dashboard → Settings → Auth → Configured Clerk
- [ ] Clerk Dashboard → JWT Template → Created "convex" template
- [ ] Redeployed Convex: `npx convex deploy`
- [ ] Vercel environment variables are correct
- [ ] Redeployed Vercel app
- [ ] Checked browser console for errors

## 🎯 Expected Result

After fixing:
- ✅ Clerk authentication works
- ✅ Convex data loads correctly
- ✅ No client-side errors
- ✅ Dashboard shows data from Convex

