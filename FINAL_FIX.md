# 🔧 FINAL FIX: Convex Server Error

## ❌ Current Error
```
[CONVEX Q(users:getAllUsers)] Server Error
```

## ✅ Complete Fix (3 Steps)

### Step 1: Convex Dashboard Configuration

Go to: https://dashboard.convex.dev → `fine-setter-221` → Settings → Auth

**Set these EXACT values:**

1. **Auth Provider:** Select **"Clerk"** or **"Custom JWT"**
2. **JWT Issuer URL/Domain:** `https://polished-clam-96.clerk.accounts.dev`
3. **Application ID:** `convex` ⚠️ **MUST BE EXACTLY "convex" (not "c")**

**Click Save**

### Step 2: Clerk Dashboard JWT Template

Go to: https://dashboard.clerk.com → Your App → JWT Templates

**Create/Edit Template:**

- **Name:** `convex` (must match exactly)
- **Token Lifetime:** 3600 seconds
- **Claims:**
  - `sub` = `{{user.id}}`
  - `iss` = `https://polished-clam-96.clerk.accounts.dev`
  - `aud` = `convex` ⚠️ **MUST match Application ID**

**Click Save**

### Step 3: Redeploy Convex

After configuring both:

```bash
npx convex deploy
```

Wait for deployment to complete.

## 🔍 Verify Configuration

### Check Convex Dashboard:
- [ ] JWT Issuer Domain: `https://polished-clam-96.clerk.accounts.dev`
- [ ] Application ID: `convex` (exactly, not "c")

### Check Clerk Dashboard:
- [ ] JWT Template name: `convex`
- [ ] `aud` claim: `convex`

### Check Your Code:
Your `convex/auth.config.ts` has:
```typescript
applicationID: "convex"
```

**All three must match exactly: `convex`**

## ⚠️ Common Mistakes

1. ❌ Application ID = `c` (WRONG - too short)
2. ❌ Application ID = `Convex` (WRONG - wrong case)
3. ❌ Application ID = `convex-app` (WRONG - has hyphen)
4. ✅ Application ID = `convex` (CORRECT)

## 🚀 After Fixing

1. **Redeploy Convex:** `npx convex deploy`
2. **Wait 30 seconds** for deployment
3. **Refresh your Vercel app**
4. **Login again**
5. **Error should be gone!**

## 📝 Why This Happens

When Convex receives a Clerk token:
1. It checks the `iss` (issuer) matches your JWT Issuer Domain ✅
2. It checks the `aud` (audience) matches your Application ID ❌ (if wrong)
3. If `aud` doesn't match Application ID, authentication fails
4. This causes "Server Error"

**The Application ID and `aud` claim MUST match exactly!**

