"use client";

/**
 * User Sync Component
 * 
 * Automatically syncs the current user from Clerk to Convex
 * if they don't exist in Convex database.
 */

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function UserSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const syncUser = useMutation(api.users.syncCurrentUser);

  useEffect(() => {
    // Only sync if user is signed in and loaded
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // If user doesn't exist in Convex, sync them
    if (currentUser === null) {
      // User exists in Clerk but not in Convex - sync them
      syncUser().catch((error) => {
        console.error("Failed to sync user:", error);
      });
    }
  }, [isLoaded, isSignedIn, currentUser, syncUser]);

  // This component doesn't render anything
  return null;
}

