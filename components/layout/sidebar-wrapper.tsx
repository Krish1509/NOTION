/**
 * Sidebar Wrapper Component
 * 
 * Client component that handles dynamic sidebar width for layout offset.
 */

"use client";

import { useSidebar } from "./sidebar-provider";
import { Role } from "@/lib/auth/roles";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface SidebarWrapperProps {
  userRole: Role;
  children: React.ReactNode;
}

export function SidebarWrapper({ userRole, children }: SidebarWrapperProps) {
  const { isCollapsed, isMounted } = useSidebar();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - fixed position */}
      <Sidebar userRole={userRole} />

      {/* Main content - offset for sidebar */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          // Mobile (<md): no offset, Sidebar hidden
          // Tablet/Desktop: offset matches sidebar width (icon vs full)
          isMounted && (isCollapsed ? "md:ml-20" : "md:ml-64")
        )}
      >
        {children}
      </div>
    </div>
  );
}

