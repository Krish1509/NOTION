/**
 * User Management Page (Manager Only)
 * 
 * Allows managers to create, edit, and manage users.
 */

import { requireRole } from "@/lib/auth/redirect";
import { ROLES } from "@/lib/auth/roles";
import { UserManagement } from "@/components/user-management/user-management";

export default async function UserManagementPage() {
  // Ensure user has manager role
  await requireRole(ROLES.MANAGER);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Create and manage users, assign roles, and control access.
        </p>
      </div>

      <UserManagement />
    </div>
  );
}

