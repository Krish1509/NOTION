# NOTION CRM

Production-ready, role-based authentication system for enterprise CRM applications.

## 🎯 Features

- **Username + Password Authentication** (NO social login, NO email login)
- **Role-Based Access Control** (Site Engineer, Manager, Purchase Officer)
- **User Management** (Manager-only user creation and management)
- **Professional UI** (shadcn/ui components, light/dark mode)
- **Fully Responsive** (Mobile, tablet, desktop)
- **Enterprise-Grade Security** (Clerk + Convex, server-side validation)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Clerk

Follow the detailed guide in [`CLERK_CONFIGURATION.md`](./CLERK_CONFIGURATION.md) to:
- Disable all authentication methods except username/password
- Copy API keys to `.env.local`

### 3. Configure Convex

```bash
# Login to Convex
npx convex login

# Start Convex dev server
npx convex dev
```

Add Convex URL to `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

### 4. Create First Manager ⭐

**IMPORTANT**: You must create the first manager manually (no public signup).

**Quick Guide**: See [`CREATE_FIRST_MANAGER.md`](./CREATE_FIRST_MANAGER.md) for step-by-step instructions.

**Summary**:
1. Create user in Clerk Dashboard
2. Add `role: "manager"` to Clerk public metadata
3. Create matching user in Convex with same `clerkUserId`

### 5. Run Development Server

```bash
# Run both Next.js and Convex
npm run dev:all

# Or separately:
npm run dev          # Next.js
npm run dev:convex   # Convex
```

### 6. Access Application

Open http://localhost:3000 → You'll be redirected to `/login` → Login with your manager credentials → Create more users!

## 📚 Documentation

- **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** - System architecture and design
- **[CLERK_CONFIGURATION.md](./CLERK_CONFIGURATION.md)** - Clerk setup guide (username/password only)
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing procedures and checklists

## 👥 User Roles

### Site Engineer
- Create site requests
- View own requests
- Mark deliveries
- **Route**: `/dashboard/site`

### Manager (Admin)
- View all requests
- Approve/reject requests
- Create and manage users
- Assign roles
- **Route**: `/dashboard/manager`

### Purchase Officer
- View approved requests
- Create purchase orders
- Manage vendors
- **Route**: `/dashboard/purchase`

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Theme**: next-themes (light/dark mode with smooth transitions)
- **Auth**: Clerk (username + password ONLY)
- **Database**: Convex
- **State**: Convex React Queries

## 📁 Project Structure

```
/app
  /(auth)/login         # Login page
  /dashboard
    /site               # Site Engineer routes
    /manager            # Manager routes (+ user management)
    /purchase           # Purchase Officer routes
  /api/admin            # Admin API routes
/components
  /ui                   # shadcn/ui components
  /layout               # Sidebar, Header
  /auth                 # Login form
  /user-management      # User CRUD components
  /dashboard            # Dashboard components
/convex
  schema.ts             # Database schema
  users.ts              # User CRUD functions
/lib
  /auth                 # Role helpers, permissions, redirects
/types
  index.ts              # TypeScript types
```

## 🔒 Security

- ✅ Username + password authentication ONLY
- ✅ NO public signup (manager creates all users)
- ✅ Server-side role validation on every request
- ✅ Middleware protects all dashboard routes
- ✅ Convex functions check permissions
- ✅ Session management by Clerk

## 🧪 Testing

See [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) for comprehensive testing procedures.

Quick test:
1. Login as manager
2. Navigate to `/dashboard/manager/users`
3. Create a site engineer user
4. Logout and login as site engineer
5. Verify redirect to `/dashboard/site`
6. Try accessing `/dashboard/manager` (should redirect)

## 🚢 Deployment

### Deploy Convex

```bash
npx convex deploy
```

### Deploy Next.js

Deploy to Vercel, Netlify, or your preferred host.

### Environment Variables

Production `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment
```

## 📝 Creating Users

Only managers can create users:

1. Login as manager
2. Go to `/dashboard/manager/users`
3. Click "Create User"
4. Fill in form (username, password, role, etc.)
5. User can now login with those credentials

## 🎨 UI Design

- Professional, enterprise-grade design
- Calm, serious aesthetic (government/contractor friendly)
- Subtle animations and transitions
- Fully responsive (mobile-first)
- Light and dark mode support
- Accessible color contrasts

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start Next.js dev server
npm run dev:convex   # Start Convex dev server
npm run dev:all      # Start both servers
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Features

1. Define types in `/types/index.ts`
2. Create Convex schema in `/convex/schema.ts`
3. Add Convex functions in `/convex/*.ts`
4. Create UI components in `/components`
5. Add pages in `/app/dashboard`
6. Update permissions in `/lib/auth/permissions.ts`

## 🐛 Troubleshooting

### "Unauthorized" on login
- Check user has `role` in Clerk `publicMetadata`
- Verify user exists in both Clerk and Convex

### Cannot create users
- Verify you're logged in as a manager
- Check Clerk API keys in `.env.local`
- Check browser console for errors

### Redirects not working
- Clear browser cache and cookies
- Verify middleware is running
- Check role in Clerk `publicMetadata`

See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) for more troubleshooting.

## 📄 License

Proprietary - NOTION CRM © 2024

## 🤝 Support

For issues or questions:
1. Check documentation in this repository
2. Review [Clerk Documentation](https://clerk.com/docs)
3. Review [Convex Documentation](https://docs.convex.dev)
4. Contact your system administrator

---

**Built with ❤️ for enterprise CRM needs**
# NOTION
