/**
 * Dashboard Layout
 * 
 * Main layout for all dashboard pages.
 * Includes sidebar navigation and header.
 */

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Check authentication
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }

  // Get user role
  const role = await getUserRole();
  
  if (!role) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (desktop only) */}
      <Sidebar userRole={role} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header userRole={role} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

