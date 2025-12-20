# 🔍 Verify Your Configuration

## ✅ Double-Check These 3 Things

### 1. Clerk JWT Template

**Go to:** https://dashboard.clerk.com → JWT Templates → `convex`

**In Claims section, you MUST see:**
```
aud = convex
```

**NOT:**
- `aud = 123` ❌
- `aud = Convex` ❌
- `aud = convex-app` ❌
- Missing `aud` claim ❌

**ONLY:**
- `aud = convex` ✅ (exactly this)

### 2. Convex Dashboard Auth

**Go to:** https://dashboard.convex.dev → `fine-setter-221` → Settings → Auth

**Must show:**
- Domain: `https://polished-clam-96.clerk.accounts.dev`
- Application ID: `convex` (exactly, lowercase)

### 3. Wait Time

After saving Clerk JWT Template:
- **Wait 1-2 minutes** for changes to propagate
- Then hard refresh browser
- Then test

---

## 🚨 Common Mistakes

1. **`aud` claim value is wrong** (most common)
   - Must be exactly: `convex`
   - Not: `123`, `Convex`, `convex-app`, etc.

2. **JWT Template name doesn't match**
   - Template name must be: `convex`
   - Application ID must be: `convex`
   - `aud` claim must be: `convex`
   - All three must match!

3. **Not waiting after changes**
   - Clerk changes take 1-2 minutes to propagate
   - Must wait before testing

---

## 📝 Exact Values Checklist

| Item | Must Be |
|------|---------|
| Clerk JWT Template Name | `convex` |
| Clerk JWT Template `aud` claim | `convex` |
| Convex Application ID | `convex` |
| Convex Domain | `https://polished-clam-96.clerk.accounts.dev` |

**All must match exactly!**

---

## 🔍 If Still Not Working

1. **Take a screenshot** of your Clerk JWT Template Claims section
2. **Take a screenshot** of your Convex Dashboard Auth settings
3. **Check browser console** for specific error messages
4. **Check Convex Dashboard → Logs** for server-side errors

The error message in Convex logs will tell us exactly what's wrong.

