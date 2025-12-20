# ✅ EXACT FIX - Follow These Steps

## 🎯 The Problem
Your Clerk JWT template has the wrong claim value (`123` instead of `convex`).

## ✅ THE FIX (3 Steps)

### Step 1: Fix Clerk JWT Template

1. **Go to:** https://dashboard.clerk.com
2. **Click:** JWT Templates
3. **Click:** `convex` template
4. **Scroll to:** Claims section
5. **Look for:** Any claim with value `123` → **DELETE IT**
6. **Click:** "Add Claim" or "+" button
7. **Enter:**
   - **Claim name:** `aud` (type exactly: aud)
   - **Value:** `convex` (type exactly: convex, no quotes)
8. **Click:** Save

**IMPORTANT:** 
- Do NOT add `iss` or `sub` - they're automatic
- Only add `aud` = `convex`

### Step 2: Verify Convex Dashboard

1. **Go to:** https://dashboard.convex.dev
2. **Select:** `fine-setter-221`
3. **Click:** Settings → Auth
4. **Verify:**
   - Domain: `https://polished-clam-96.clerk.accounts.dev`
   - Application ID: `convex`
5. If correct, done. If wrong, fix and Save.

### Step 3: Redeploy & Test

```bash
npx convex deploy
```

Wait for "✔ Deployed" message.

Then:
1. **Hard refresh browser:** `Ctrl+Shift+R`
2. **Go to your Vercel app**
3. **Logout**
4. **Login again**
5. **Test** - should work!

---

## ✅ Final Checklist

**Clerk:**
- [ ] JWT Template name: `convex`
- [ ] Claims has ONLY: `aud` = `convex`
- [ ] No `123` value
- [ ] No `iss` or `sub` claims (they're automatic)

**Convex:**
- [ ] Domain: `https://polished-clam-96.clerk.accounts.dev`
- [ ] Application ID: `convex`

**Both match:** `convex` ✅

---

## 🚨 Why It Fails

If `aud` claim is wrong or missing:
- Convex receives token
- Convex checks `aud` claim
- `aud` doesn't match Application ID (`convex`)
- Authentication fails
- You get "Server Error"

**Solution:** Make sure `aud` = `convex` exactly!

