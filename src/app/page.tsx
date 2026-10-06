import {
  AdminShell,
} from "@/components/layout/AdminShell";

import {
  AdminDashboard,
} from "@/features/dashboard/components/AdminDashboard";

//************************************************************** */

export default function AdminOverviewPage() {
  return (
    <AdminShell
      activeSection="overview"
      title="Platform Overview"
      description="Organization growth, user accounts, and platform metrics."
    >
      <AdminDashboard />
    </AdminShell>
  );
}

//************************************************************** */