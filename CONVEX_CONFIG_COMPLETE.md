# ✅ Complete Convex Configuration

## What You've Done ✅
- ✅ Set `CLERK_JWT_ISSUER_DOMAIN` = `https://polished-clam-96.clerk.accounts.dev`

## What You Still Need ⚠️

### 1. Set Application ID in Convex Dashboard

In Convex Dashboard → Settings → Auth, you also need:

**Application ID:** `convex`

This must match the `applicationID` in your `convex/auth.config.ts` file.

### 2. Complete Configuration Should Be:

In Convex Dashboard → Settings → Auth:

- **Auth Provider:** `Clerk` (or "Custom JWT")
- **JWT Issuer URL/Domain:** `https://polished-clam-96.clerk.accounts.dev` ✅ (You have this)
- **Application ID:** `c` ⚠️ (You need this!)

### 3. Verify Clerk JWT Template

Make sure in Clerk Dashboard → JWT Templates:

- **Template Name:** `convex`
- **Claims:**
  - `sub`: `{{user.id}}`
  - `iss`: `https://polished-clam-96.clerk.accounts.dev`
  - `aud`: `convex`

## 🚀 After Completing Configuration

1. **Save** in Convex Dashboard
2. **Save** in Clerk Dashboard
3. **Redeploy Convex:**
   ```bash
   npx convex deploy
   ```
4. **Test your app** - errors should be gone!

## 📝 Quick Checklist

- [x] Convex: JWT Issuer Domain set ✅
- [ ] Convex: Application ID set to `convex` ⚠️
- [ ] Clerk: JWT Template "convex" created ⚠️
- [ ] Redeployed Convex
- [ ] Tested app

## ⚠️ Important

The **Application ID** (`convex`) must match:
1. The `applicationID` in `convex/auth.config.ts`
2. The `aud` claim in your Clerk JWT template
3. The template name in Clerk Dashboard

All three must be the same: `convex`

