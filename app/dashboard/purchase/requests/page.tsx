/**
 * Purchase Approved Requests Page
 * 
 * View approved requests for creating POs (placeholder for now).
 */

import { requireRole } from "@/lib/auth/redirect";
import { ROLES } from "@/lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PurchaseRequestsPage() {
  await requireRole(ROLES.PURCHASE_OFFICER);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approved Requests</h1>
        <p className="text-muted-foreground">
          View approved requests to create purchase orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Requests</CardTitle>
          <CardDescription>Requests approved by managers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No approved requests yet. Managers will approve requests soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

