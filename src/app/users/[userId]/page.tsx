import {
  AdminShell,
} from "@/components/layout/AdminShell";

import {
  UserDetails,
} from "@/features/users/components/UserDetails";

//************************************************************** */

type UserPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

//************************************************************** */

export default async function AdminUserPage({
  params,
}: UserPageProps) {
  const { userId } = await params;

  return (
    <AdminShell
      activeSection="users"
      title="User Details"
      description="Account information, verification status, and organization memberships."
    >
      <UserDetails
        key={userId}
        userId={userId}
      />
    </AdminShell>
  );
}

//************************************************************** */