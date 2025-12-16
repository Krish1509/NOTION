/**
 * Permission Checks
 * 
 * Defines granular permissions for each role.
 */

import { Role, ROLES } from "./roles";

export const PERMISSIONS = {
  // Request permissions
  CREATE_REQUEST: "create_request",
  VIEW_OWN_REQUESTS: "view_own_requests",
  VIEW_ALL_REQUESTS: "view_all_requests",
  APPROVE_REQUEST: "approve_request",
  REJECT_REQUEST: "reject_request",
  MARK_DELIVERY: "mark_delivery",

  // User management permissions
  CREATE_USER: "create_user",
  EDIT_USER: "edit_user",
  VIEW_USERS: "view_users",
  ASSIGN_ROLE: "assign_role",
  DISABLE_USER: "disable_user",

  // Purchase order permissions
  CREATE_PO: "create_po",
  VIEW_PO: "view_po",
  EDIT_PO: "edit_po",

  // Vendor permissions
  CREATE_VENDOR: "create_vendor",
  EDIT_VENDOR: "edit_vendor",
  VIEW_VENDORS: "view_vendors",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role → Permissions mapping
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SITE_ENGINEER]: [
    PERMISSIONS.CREATE_REQUEST,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.MARK_DELIVERY,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_ALL_REQUESTS,
    PERMISSIONS.APPROVE_REQUEST,
    PERMISSIONS.REJECT_REQUEST,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.ASSIGN_ROLE,
    PERMISSIONS.DISABLE_USER,
  ],
  [ROLES.PURCHASE_OFFICER]: [
    PERMISSIONS.VIEW_ALL_REQUESTS, // Only approved requests
    PERMISSIONS.CREATE_PO,
    PERMISSIONS.VIEW_PO,
    PERMISSIONS.EDIT_PO,
    PERMISSIONS.CREATE_VENDOR,
    PERMISSIONS.EDIT_VENDOR,
    PERMISSIONS.VIEW_VENDORS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

