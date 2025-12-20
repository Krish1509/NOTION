# 🔧 COMPLETE FIX - 100% Solution

## ❌ Current Problem
Convex Server Error - Authentication failing

## ✅ THE FIX (Do These 3 Things)

### 1. Fix Clerk JWT Template (CRITICAL!)

**Go to:** https://dashboard.clerk.com → JWT Templates → `convex`

**In Claims section:**
1. **DELETE** any claim with value `123` (if exists)
2. **ADD** claim:
   - **Name:** `aud`
   - **Value:** `convex` (exactly, no quotes, no spaces)
3. **Click Save**

### 2. Verify Convex Dashboard

**Go to:** https://dashboard.convex.dev → `fine-setter-221` → Settings → Auth

**Must have:**
- Domain: `https://polished-clam-96.clerk.accounts.dev`
- Application ID: `convex` (exactly)

If wrong, fix and Save.

### 3. Redeploy & Test

```bash
npx convex deploy
```

Then:
1. **Hard refresh:** `Ctrl+Shift+R`
2. **Clear browser cache**
3. **Logout and login again**
4. **Test**

---

## 🔍 Why It's Still Failing

The error shows Convex is receiving requests but can't authenticate. This means:

1. ✅ Connection to Convex works
2. ❌ Authentication fails because:
   - `aud` claim is wrong/missing in Clerk JWT template
   - OR Application ID doesn't match
   - OR JWT template name doesn't match

## ✅ Verification Checklist

**Clerk Dashboard:**
- [ ] JWT Template name: `convex`
- [ ] Claims has: `aud` = `convex` (NOT `123`, NOT empty)
- [ ] No other incorrect claims

**Convex Dashboard:**
- [ ] Settings → Auth → Domain: `https://polished-clam-96.clerk.accounts.dev`
- [ ] Settings → Auth → Application ID: `convex`

**Code:**
- [ ] `convex/auth.config.ts` has `applicationID: "convex"`

**All three must match exactly: `convex`**

---

## 🚨 Most Common Mistake

Having `aud` = `123` or missing `aud` claim entirely!

**Must be:** `aud` = `convex`

---

## 📝 After Fixing

1. Save Clerk JWT Template
2. `npx convex deploy`
3. Hard refresh browser
4. Logout/login
5. Test - should work!

