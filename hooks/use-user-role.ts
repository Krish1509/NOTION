"use client";

/**
 * useUserRole Hook
 * 
 * Client-side hook to get the current user's role from Clerk.
 */

import { useUser } from "@clerk/nextjs";
import { Role, isValidRole } from "@/lib/auth/roles";

export function useUserRole(): Role | null {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const role = user.publicMetadata?.role as string | undefined;

  if (!role || !isValidRole(role)) {
    return null;
  }

  return role;
}

