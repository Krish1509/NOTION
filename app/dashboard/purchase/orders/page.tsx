/**
 * Purchase Orders Page
 * 
 * Create and manage purchase orders (placeholder for now).
 */

import { requireRole } from "@/lib/auth/redirect";
import { ROLES } from "@/lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PurchaseOrdersPage() {
  await requireRole(ROLES.PURCHASE_OFFICER);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Create and manage purchase orders
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New PO
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>All purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No purchase orders yet. Create your first PO to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

