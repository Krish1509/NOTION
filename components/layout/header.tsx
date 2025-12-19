"use client";

/**
 * Header Component
 * 
 * Top navigation bar with user info, theme toggle, chat, and logout.
 */

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import { ChatIcon } from "@/components/chat/chat-icon";
import { ChatWindow } from "@/components/chat/chat-window";
import { StickyNotesIcon } from "@/components/sticky-notes/sticky-notes-icon";
import { StickyNotesWindow } from "@/components/sticky-notes/sticky-notes-window";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { MobileSidebar } from "./mobile-sidebar";
import { Role } from "@/lib/auth/roles";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface HeaderProps {
  userRole: Role;
}

export function Header({ userRole }: HeaderProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [stickyNotesOpen, setStickyNotesOpen] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile menu (< md) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
              <MobileSidebar userRole={userRole} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Empty space (brand is in sidebar) */}
        <div className="hidden md:block" />

        {/* Mobile: Brand */}
        <div className="md:hidden">
          <h1 className="text-xl font-bold">NOTION</h1>
        </div>

        {/* Right side: Sticky Notes + Chat + Theme toggle + Custom User Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {currentUser && (
            <>
              <StickyNotesIcon onClick={() => setStickyNotesOpen(true)} />
            <ChatIcon onClick={() => setChatOpen(true)} />
            </>
          )}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {/* Chat Sheet */}
      {currentUser && (
        <Sheet open={chatOpen} onOpenChange={setChatOpen}>
          <SheetContent 
            side="right" 
            className="p-0 w-full sm:w-[500px] md:w-[600px]"
          >
            <VisuallyHidden>
              <SheetTitle>Chat</SheetTitle>
            </VisuallyHidden>
            <ChatWindow 
              currentUserId={currentUser._id} 
              onClose={() => setChatOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Sticky Notes Sheet */}
      {currentUser && (
        <Sheet open={stickyNotesOpen} onOpenChange={setStickyNotesOpen}>
          <SheetContent 
            side="right" 
            className="p-0 w-full max-w-full"
          >
            <VisuallyHidden>
              <SheetTitle>Sticky Notes</SheetTitle>
            </VisuallyHidden>
            <StickyNotesWindow 
              currentUserId={currentUser._id} 
              onClose={() => setStickyNotesOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}

