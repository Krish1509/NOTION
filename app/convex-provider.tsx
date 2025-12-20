"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode, useMemo } from "react";

/**
 * Convex client provider using Clerk integration helper.
 * This automatically forwards Clerk tokens to Convex.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Get Convex URL from environment variable
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  // Create Convex client with proper error handling
  const convex = useMemo(() => {
    if (!convexUrl) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set!");
      // Fallback to localhost for development
      return new ConvexReactClient("http://127.0.0.1:3210");
    }
    
    try {
      return new ConvexReactClient(convexUrl);
    } catch (error) {
      console.error("Failed to create Convex client:", error);
      throw error;
    }
  }, [convexUrl]);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

