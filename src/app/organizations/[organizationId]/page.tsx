import {
  AdminShell,
} from "@/components/layout/AdminShell";

import {
  OrganizationDetails,
} from "@/features/organizations/components/OrganizationDetails";

//************************************************************** */

type OrganizationPageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

//************************************************************** */

export default async function AdminOrganizationPage({
  params,
}: OrganizationPageProps) {
  const { organizationId } = await params;

  return (
    <AdminShell
      activeSection="organizations"
      title="Organization Details"
      description="Organization information, record counts, and membership access."
    >
      <OrganizationDetails
        key={organizationId}
        organizationId={organizationId}
      />
    </AdminShell>
  );
}

//************************************************************** */