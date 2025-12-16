"use client";

/**
 * Header Component
 * 
 * Top navigation bar with user info, theme toggle, and logout.
 */

import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";
import { Role } from "@/lib/auth/roles";

interface HeaderProps {
  userRole: Role;
}

export function Header({ userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <MobileSidebar userRole={userRole} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Empty space (brand is in sidebar) */}
        <div className="hidden lg:block" />

        {/* Mobile: Brand */}
        <div className="lg:hidden">
          <h1 className="text-xl font-bold">NOTION</h1>
        </div>

        {/* Right side: Theme toggle + Custom User Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

