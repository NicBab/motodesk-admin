import {
  AdminShell,
} from "@/components/layout/AdminShell";

import {
  OrganizationDirectory,
} from "@/features/organizations/components/OrganizationDirectory";

//************************************************************** */

export default function AdminOrganizationsPage() {
  return (
    <AdminShell
      activeSection="organizations"
      title="Organizations"
      description="Review organizations, membership counts, and account status across MotoDesk."
    >
      <OrganizationDirectory />
    </AdminShell>
  );
}

//************************************************************** */