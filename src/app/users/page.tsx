import {
  AdminShell,
} from "@/components/layout/AdminShell";

import {
  UserDirectory,
} from "@/features/users/components/UserDirectory";

//************************************************************** */

export default function AdminUsersPage() {
  return (
    <AdminShell
      activeSection="users"
      title="Users"
      description="Review user accounts, email verification, and organization memberships across MotoDesk."
    >
      <UserDirectory />
    </AdminShell>
  );
}

//************************************************************** */