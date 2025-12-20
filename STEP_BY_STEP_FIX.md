# 🎯 Step-by-Step: Complete Fix (Copy-Paste Ready)

## ✅ Step 1: Add `aud` Claim in Clerk Dashboard

1. **Open:** https://dashboard.clerk.com
2. **Select your application**
3. **Click:** JWT Templates (left sidebar)
4. **Click:** `convex` template (or create if doesn't exist)
5. **Scroll to:** Claims section
6. **Click:** "Add Claim" or "+" button
7. **Enter:**
   - **Claim name:** `aud`
   - **Value:** `convex`
8. **Click:** Save

## ✅ Step 2: Verify Convex Dashboard Auth

1. **Open:** https://dashboard.convex.dev
2. **Select:** `fine-setter-221` deployment
3. **Click:** Settings (left sidebar)
4. **Click:** Auth
5. **Verify:**
   - Domain: `https://polished-clam-96.clerk.accounts.dev`
   - Application ID: `convex`
6. If correct, you're done. If not, fix it and Save.

## ✅ Step 3: Redeploy Convex

Run this command in your terminal:

```bash
npx convex deploy
```

Wait for it to complete (you'll see "✔ Deployed Convex functions to...")

## ✅ Step 4: Test

1. **Hard refresh browser:** `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Go to your Vercel app**
3. **Logout** (if logged in)
4. **Login again**
5. **Test** - errors should be gone!

---

## 📋 Quick Checklist

- [ ] Clerk Dashboard → JWT Template → `aud` = `convex` claim added
- [ ] Convex Dashboard → Settings → Auth → Application ID = `convex`
- [ ] Redeployed Convex: `npx convex deploy`
- [ ] Hard refreshed browser
- [ ] Tested app - no errors

---

## ⚠️ If Still Not Working

Check Convex Dashboard → Logs for specific error messages.

