"use client";

/**
 * Inventory Management Component
 * 
 * Main component for managing inventory items.
 */

import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InventoryFormDialog } from "./inventory-form-dialog";
import { InventoryTable } from "./inventory-table";
import { ROLES, Role } from "@/lib/auth/roles";

interface InventoryManagementProps {
  userRole: Role;
}

export function InventoryManagement({ userRole }: InventoryManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const canCreate = userRole === ROLES.PURCHASE_OFFICER;

  // Only fetch inventory if user is signed in
  const items = useQuery(
    api.inventory.getAllInventoryItems,
    isLoaded && isSignedIn ? {} : "skip"
  );

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Total items: {items?.length || 0}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Inventory Item
          </Button>
        )}
      </div>

      {/* Inventory table */}
      <InventoryTable items={items ?? undefined} />

      {/* Create inventory dialog */}
      {canCreate && (
        <InventoryFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      )}
    </div>
  );
}

