/**
 * Purchase Officer Dashboard
 * 
 * Dashboard for purchase officers to manage POs and vendors.
 */

import { requireRole } from "@/lib/auth/redirect";
import { ROLES } from "@/lib/auth/roles";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Building2, Package } from "lucide-react";
import Link from "next/link";

export default async function PurchaseOfficerDashboard() {
  // Ensure user has purchase_officer role
  await requireRole(ROLES.PURCHASE_OFFICER);

  return (
    <div className="space-y-8">
      <WelcomeHeader role={ROLES.PURCHASE_OFFICER} />

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase Orders
            </CardTitle>
            <CardDescription>
              Create and manage POs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/purchase/orders">
              <Button className="w-full">View POs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendors
            </CardTitle>
            <CardDescription>
              Manage vendor relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/purchase/vendors">
              <Button variant="outline" className="w-full">
                Manage Vendors
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Approved Requests
            </CardTitle>
            <CardDescription>
              View approved site requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/purchase/requests">
              <Button variant="outline" className="w-full">
                View Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
            <CardDescription>Latest POs created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              No purchase orders yet. Create your first PO to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Vendors</CardTitle>
            <CardDescription>Total active vendors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">active vendors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

