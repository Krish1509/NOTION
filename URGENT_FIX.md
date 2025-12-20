# 🚨 URGENT: Fix Convex Server Error

## Error Message
```
[CONVEX Q(users:getAllUsers)] Server Error
```

## Root Cause
**Convex Dashboard is NOT configured to accept Clerk authentication!**

When Convex tries to authenticate the user, it fails because it doesn't know how to verify Clerk tokens.

## ✅ FIX NOW (2 Steps)

### Step 1: Configure Convex Dashboard (CRITICAL!)

1. **Go to:** https://dashboard.convex.dev
2. **Select deployment:** `fine-setter-221`
3. **Click:** Settings (left sidebar)
4. **Click:** Auth (in Settings)
5. **Configure:**
   - **Auth Provider:** Select **"Clerk"** from dropdown
   - **JWT Issuer URL:** `https://polished-clam-96.clerk.accounts.dev`
   - **Application ID:** `convex`
6. **Click:** Save

### Step 2: Configure Clerk JWT Template

1. **Go to:** https://dashboard.clerk.com
2. **Select your application**
3. **Click:** JWT Templates (left sidebar)
4. **Click:** Create Template (or edit existing)
5. **Configure:**
   - **Name:** `convex` (must match exactly!)
   - **Token Lifetime:** 3600 seconds
   - **Claims:** Click "Add Claim" and add:
     - **Key:** `sub` → **Value:** `{{user.id}}`
     - **Key:** `iss` → **Value:** `https://polished-clam-96.clerk.accounts.dev`
     - **Key:** `aud` → **Value:** `convex`
6. **Click:** Save

### Step 3: Redeploy Convex

After configuring both:

```bash
npx convex deploy
```

## ✅ Verification

After fixing:
1. Refresh your Vercel app
2. Login again
3. Data should load without errors
4. No more "Server Error" messages

## ⚠️ Why This Happens

- Convex receives Clerk tokens from your app
- But Convex doesn't know how to verify them
- So `ctx.auth.getUserIdentity()` returns `null`
- Which causes "Not authenticated" error
- Which shows as "Server Error" to the client

## 📝 Quick Checklist

- [ ] Convex Dashboard → Settings → Auth → Clerk configured
- [ ] Clerk Dashboard → JWT Template → "convex" template created
- [ ] Redeployed Convex: `npx convex deploy`
- [ ] Tested app - no more errors

**This is the ONLY fix needed!** Once Convex knows how to verify Clerk tokens, everything will work.

