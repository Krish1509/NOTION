/**
 * Vendors Page
 * 
 * Manage vendors (Purchase Officer: CRUD, Manager: Read-only).
 */

import { requireRole } from "@/lib/auth/redirect";
import { ROLES } from "@/lib/auth/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VendorManagement } from "@/components/vendors/vendor-management";

export default async function VendorsPage() {
  // Check if user is Purchase Officer or Manager
  const role = await requireRole([ROLES.PURCHASE_OFFICER, ROLES.MANAGER]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>All registered vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <VendorManagement showTableOnly={role === ROLES.MANAGER} />
        </CardContent>
      </Card>
    </div>
  );
}

