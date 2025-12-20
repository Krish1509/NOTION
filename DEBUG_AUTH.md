# 🔍 Debug: Convex Authentication Still Failing

## Current Error
```
[CONVEX Q(vendors:getAllVendors)] Server Error
```

## Possible Causes

### 1. Clerk JWT Template Missing `aud` Claim ⚠️ MOST LIKELY

**Check in Clerk Dashboard:**
1. Go to: https://dashboard.clerk.com
2. JWT Templates → `convex` template
3. **Verify Claims section has:**
   - `aud` = `convex` (this is CRITICAL!)

If `aud` claim is missing or wrong, Convex will reject all tokens.

### 2. Convex Not Redeployed After Auth Config

After configuring Auth in Convex Dashboard, you MUST redeploy:

```bash
npx convex deploy
```

### 3. Token Not Being Sent Correctly

Check browser console (F12) for:
- Convex connection errors
- Authentication errors
- Token errors

## ✅ Step-by-Step Verification

### Step 1: Verify Clerk JWT Template

In Clerk Dashboard → JWT Templates → `convex`:

**Must have:**
- Name: `convex`
- Claims:
  - `aud` = `convex` ⚠️ **This is required!**

**Should NOT have:**
- `sub` (automatic)
- `iss` (automatic)

### Step 2: Verify Convex Auth Config

In Convex Dashboard → Settings → Auth:

**Must have:**
- Domain: `https://polished-clam-96.clerk.accounts.dev`
- Application ID: `convex`

### Step 3: Redeploy Convex

```bash
npx convex deploy
```

Wait for deployment to complete.

### Step 4: Clear Browser Cache

1. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Or clear browser cache
3. Login again

### Step 5: Check Browser Console

Open browser console (F12) and look for:
- Convex connection messages
- Authentication errors
- Token validation errors

## 🔍 Debug Commands

### Check if Convex is receiving tokens:

1. Open browser console
2. Type: `localStorage.getItem('clerk-session')`
3. Should show session data

### Check Convex connection:

1. Open browser console
2. Look for Convex logs
3. Check Network tab for requests to `fine-setter-221.convex.cloud`

## ⚠️ Most Common Issue

**The `aud` claim in Clerk JWT Template is missing or incorrect!**

Make sure:
- Clerk JWT Template → Claims → `aud` = `convex` (exactly)
- Convex Dashboard → Application ID = `convex` (exactly)
- Both must match exactly!

## 🚀 Quick Fix

1. **Verify Clerk JWT Template has `aud` = `convex`**
2. **Redeploy Convex:** `npx convex deploy`
3. **Hard refresh browser:** `Ctrl+Shift+R`
4. **Login again**
5. **Test**

If still failing, check Convex Dashboard → Logs for specific error messages.

