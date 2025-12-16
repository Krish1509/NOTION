"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

/**
 * Client-side Providers Wrapper
 * 
 * Wraps all client-side providers to avoid hydration issues
 * and script placement errors.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

