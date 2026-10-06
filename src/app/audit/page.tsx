import {
  AdminShell,
} from "@/components/layout/AdminShell";

import {
  PlatformAuditViewer,
} from "@/features/audit/components/PlatformAuditViewer";

//************************************************************** */

export default function AdminAuditPage() {
  return (
    <AdminShell
      activeSection="audit"
      title="Audit Logs"
      description="Review recorded activity across organizations and unassigned audit events."
    >
      <PlatformAuditViewer />
    </AdminShell>
  );
}

//************************************************************** */