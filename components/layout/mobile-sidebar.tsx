"use client";

/**
 * Mobile Sidebar Component
 * 
 * Navigation menu for mobile devices (inside Sheet).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role, ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ShoppingCart, 
  Package,
  Building2,
  MessageCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const navigationItems: NavigationItem[] = [
  // Site Engineer
  {
    label: "Dashboard",
    href: "/dashboard/site",
    icon: LayoutDashboard,
    roles: [ROLES.SITE_ENGINEER],
  },
  {
    label: "My Requests",
    href: "/dashboard/site/requests",
    icon: FileText,
    roles: [ROLES.SITE_ENGINEER],
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: MessageCircle,
    roles: [ROLES.SITE_ENGINEER],
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    roles: [ROLES.SITE_ENGINEER],
  },
  
  // Manager
  {
    label: "Dashboard",
    href: "/dashboard/manager",
    icon: LayoutDashboard,
    roles: [ROLES.MANAGER],
  },
  {
    label: "All Requests",
    href: "/dashboard/manager/requests",
    icon: FileText,
    roles: [ROLES.MANAGER],
  },
  {
    label: "User Management",
    href: "/dashboard/manager/users",
    icon: Users,
    roles: [ROLES.MANAGER],
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: MessageCircle,
    roles: [ROLES.MANAGER],
  },
  {
    label: "Vendors",
    href: "/dashboard/vendors",
    icon: Building2,
    roles: [ROLES.MANAGER],
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    roles: [ROLES.MANAGER],
  },
  
  // Purchase Officer
  {
    label: "Dashboard",
    href: "/dashboard/purchase",
    icon: LayoutDashboard,
    roles: [ROLES.PURCHASE_OFFICER],
  },
  {
    label: "Purchase Orders",
    href: "/dashboard/purchase/orders",
    icon: ShoppingCart,
    roles: [ROLES.PURCHASE_OFFICER],
  },
  {
    label: "Approved Requests",
    href: "/dashboard/purchase/requests",
    icon: Package,
    roles: [ROLES.PURCHASE_OFFICER],
  },
  {
    label: "Vendors",
    href: "/dashboard/vendors",
    icon: Building2,
    roles: [ROLES.PURCHASE_OFFICER],
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    roles: [ROLES.PURCHASE_OFFICER],
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: MessageCircle,
    roles: [ROLES.PURCHASE_OFFICER],
  },
];

interface MobileSidebarProps {
  userRole: Role;
}

export function MobileSidebar({ userRole }: MobileSidebarProps) {
  const pathname = usePathname();

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">NOTION</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {ROLE_LABELS[userRole]}
        </p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          v1.0.0 © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

