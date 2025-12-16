/**
 * Manager Requests Page
 * 
 * View and approve/reject all requests (placeholder for now).
 */

import { requireRole } from "@/lib/auth/redirect";
import { ROLES } from "@/lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ManagerRequestsPage() {
  await requireRole(ROLES.MANAGER);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Requests</h1>
        <p className="text-muted-foreground">
          Review and approve site requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>All site requests from engineers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No requests yet. Site engineers will create requests soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

