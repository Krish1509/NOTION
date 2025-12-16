/**
 * Role-Based Redirect Logic
 * 
 * Handles redirecting users to their appropriate dashboards based on role.
 */

import { redirect } from "next/navigation";
import { Role, getRoleDashboardRoute } from "./roles";
import { getUserRole } from "./get-user-role";

/**
 * Redirect user to their role-specific dashboard
 * Server-side only
 */
export async function redirectToDashboard(): Promise<never> {
  const role = await getUserRole();

  if (!role) {
    redirect("/login");
  }

  const dashboardRoute = getRoleDashboardRoute(role);
  redirect(dashboardRoute);
}

/**
 * Ensure user has the required role, otherwise redirect to login or their dashboard
 * Server-side only
 */
export async function requireRole(requiredRole: Role): Promise<void> {
  const role = await getUserRole();

  if (!role) {
    redirect("/login");
  }

  if (role !== requiredRole) {
    // Redirect to their own dashboard
    const dashboardRoute = getRoleDashboardRoute(role);
    redirect(dashboardRoute);
  }
}

/**
 * Ensure user has one of the required roles, otherwise redirect
 * Server-side only
 */
export async function requireAnyRole(requiredRoles: Role[]): Promise<Role> {
  const role = await getUserRole();

  if (!role) {
    redirect("/login");
  }

  if (!requiredRoles.includes(role)) {
    // Redirect to their own dashboard
    const dashboardRoute = getRoleDashboardRoute(role);
    redirect(dashboardRoute);
  }

  return role;
}

