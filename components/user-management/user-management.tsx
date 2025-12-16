"use client";

/**
 * User Management Component
 * 
 * Main component for managing users (Manager only).
 */

import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateUserDialog } from "./create-user-dialog";
import { UserTable } from "./user-table";

export function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  
  // Only fetch users if user is signed in
  const users = useQuery(
    api.users.getAllUsers,
    isLoaded && isSignedIn ? {} : "skip"
  );

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Total users: {users?.length || 0}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* User table */}
      <UserTable users={users ?? undefined} />

      {/* Create user dialog */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

