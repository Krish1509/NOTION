/**
 * Auth Layout
 * 
 * Layout for authentication pages (login).
 * Clean, centered design without dashboard navigation.
 */

import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with theme toggle */}
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>NOTION CRM © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

