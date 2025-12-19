"use client";

/**
 * Vendor Management Component
 * 
 * Main component for managing vendors.
 */

import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VendorFormDialog } from "./vendor-form-dialog";
import { VendorTable } from "./vendor-table";

interface VendorManagementProps {
  showTableOnly?: boolean;
}

export function VendorManagement({ showTableOnly = false }: VendorManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  // Only fetch vendors if user is signed in
  const vendors = useQuery(
    api.vendors.getAllVendors,
    isLoaded && isSignedIn ? {} : "skip"
  );

  if (showTableOnly) {
    return <VendorTable vendors={vendors ?? undefined} />;
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Total vendors: {vendors?.length || 0}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Vendor table */}
      <VendorTable vendors={vendors ?? undefined} />

      {/* Create vendor dialog */}
      <VendorFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

