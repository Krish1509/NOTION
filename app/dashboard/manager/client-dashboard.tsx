"use client";

/**
 * Client Component for Manager Dashboard
 *
 * Simple welcome message for managers.
 */

import { ROLES } from "@/lib/auth/roles";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";

export default function ManagerDashboardClient() {
  return (
    <div className="space-y-6">
      <WelcomeHeader role={ROLES.MANAGER} />
    </div>
  );
}
