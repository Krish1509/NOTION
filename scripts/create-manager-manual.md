# Create First Manager Account - Manual Guide

Since we don't have public signup, you need to create the first manager manually. Follow these steps:

## Method 1: Via Clerk Dashboard (Recommended)

### Step 1: Create User in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"Users"** in the sidebar
4. Click **"Create User"** button
5. Fill in the form:
   - **Username**: `admin` (or your choice)
   - **Password**: Your secure password (min 8 characters)
   - **Skip email/phone** (we only use username)
6. Click **"Create"**

### Step 2: Add Role to Clerk User

1. After creating the user, click on the user to open their profile
2. Go to **"Metadata"** tab
3. In **"Public metadata"**, click **"Edit"**
4. Add this JSON:
```json
{
  "role": "manager"
}
```
5. Click **"Save"**

### Step 3: Create User in Convex

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to **"Data"** → **"users"** table
4. Click **"Add Document"** button
5. Copy the **Clerk User ID** from Clerk (it looks like `user_xxxxx`)
6. Add this JSON (replace values with your actual data):

```json
{
  "clerkUserId": "user_xxxxx",
  "username": "admin",
  "fullName": "System Administrator",
  "phoneNumber": "+1234567890",
  "address": "Admin Office",
  "role": "manager",
  "isActive": true,
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000
}
```

**Note**: Replace `1704067200000` with current timestamp. You can get it by running `Date.now()` in browser console.

7. Click **"Save"**

### Step 4: Test Login

1. Start your dev server: `npm run dev:all`
2. Open http://localhost:3000
3. You'll be redirected to `/login`
4. Enter your username and password
5. You should be redirected to `/dashboard/manager`
6. Go to **"User Management"** to create more users!

---

## Method 2: Via Clerk API (Advanced)

If you prefer using the API:

### Step 1: Create User via API

```bash
curl -X POST https://api.clerk.com/v1/users \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword123",
    "public_metadata": {
      "role": "manager"
    }
  }'
```

Save the `id` from the response (this is the `clerkUserId`).

### Step 2: Create User in Convex

Follow **Step 3** from Method 1, using the `clerkUserId` from the API response.

---

## Quick Checklist

- [ ] User created in Clerk Dashboard
- [ ] Role `"manager"` added to Clerk public metadata
- [ ] User created in Convex with matching `clerkUserId`
- [ ] Can login with username and password
- [ ] Redirected to `/dashboard/manager` after login
- [ ] Can access `/dashboard/manager/users` page

---

## Troubleshooting

### "Unauthorized" after login
- ✅ Check that user has `role: "manager"` in Clerk public metadata
- ✅ Verify the role value is exactly `"manager"` (lowercase, no spaces)

### "User not found" error
- ✅ Check that Convex user exists with matching `clerkUserId`
- ✅ Verify `clerkUserId` matches exactly between Clerk and Convex
- ✅ Ensure Convex user has `role: "manager"`

### Cannot access user management
- ✅ Verify you're logged in as manager
- ✅ Check browser console for errors
- ✅ Clear browser cache and cookies

### Login page not showing
- ✅ Check that `npm run dev` is running
- ✅ Verify Clerk API keys are in `.env.local`
- ✅ Check browser console for errors

---

## After Creating Manager

Once you have a manager account:

1. **Login** as manager
2. Go to **`/dashboard/manager/users`**
3. Click **"Create User"**
4. Fill in the form to create:
   - Site Engineers
   - Other Managers
   - Purchase Officers

All future users can be created through the UI (no manual setup needed)!

---

**Need help?** Check `CLERK_CONFIGURATION.md` for detailed Clerk setup instructions.

