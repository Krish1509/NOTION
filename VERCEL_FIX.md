# 🔧 Fix Vercel 500 Error - MIDDLEWARE_INVOCATION_FAILED

## ❌ Problem

Your `CLERK_SECRET_KEY` in Vercel is **MISSING the "sk" prefix**!

**Current (WRONG):**
```
k_test_Fcd66aheQORvnlHDqZ9pcS4A4Y64f3u1wk9B4cedYD
```

**Should be:**
```
sk_test_Fcd66aheQORvnlHDqZ9pcS4A4Y64f3u1wk9B4cedYD
```

## ✅ Fix Steps

1. **Go to Vercel Environment Variables:**
   https://vercel.com/krish1509s-projects/notion/settings/environment-variables

2. **Find `CLERK_SECRET_KEY` and click Edit**

3. **Fix the value - ADD "sk" at the beginning:**
   ```
   sk_test_Fcd66aheQORvnlHDqZ9pcS4A4Y64f3u1wk9B4cedYD
   ```
   (Add "sk" before "test")

4. **Save**

5. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

## 📋 Correct Environment Variables

After fixing, your variables should be:

| Variable | Current Value | Should Be |
|----------|--------------|-----------|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ `https://fine-setter-221.convex.cloud` | ✅ Correct |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ⚠️ `pk_test_...` | ⚠️ Should be `pk_live_...` for production |
| `CLERK_SECRET_KEY` | ❌ `k_test_...` (MISSING "sk") | ✅ `sk_test_...` or `sk_live_...` |

## ⚠️ Important Notes

1. **For Production:** You should use **LIVE** keys (`pk_live_...` and `sk_live_...`) instead of test keys
2. **Test keys work** but LIVE keys are recommended for production
3. **The "sk" prefix is REQUIRED** - without it, Clerk middleware will fail

## 🚀 After Fixing

1. Redeploy your app
2. The 500 error should be resolved
3. Your middleware should work correctly

