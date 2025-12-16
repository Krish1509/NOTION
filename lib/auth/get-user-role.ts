/**
 * Get User Role Helpers
 * 
 * Server-side utilities to fetch the current user's role.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { Role, isValidRole } from "./roles";

/**
 * Get the current user's role from Clerk metadata
 * Server-side only
 */
export async function getUserRole(): Promise<Role | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Role is stored in publicMetadata
  const role = user.publicMetadata?.role as string | undefined;

  if (!role || !isValidRole(role)) {
    return null;
  }

  return role;
}

/**
 * Get the current user's Clerk ID
 * Server-side only
 */
export async function getUserClerkId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if the current user has a specific role
 * Server-side only
 */
export async function hasRole(requiredRole: Role): Promise<boolean> {
  const role = await getUserRole();
  return role === requiredRole;
}

/**
 * Check if the current user is authenticated
 * Server-side only
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

