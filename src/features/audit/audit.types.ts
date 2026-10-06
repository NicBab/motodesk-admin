import type {
  PlatformPaginatedResponse,
} from "@/features/organizations/organization.types";

//************************************************************** */

export type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | {
      [key: string]: AuditJsonValue;
    };

//************************************************************** */

export type PlatformAuditScope =
  | "ALL"
  | "ORGANIZATION"
  | "UNASSIGNED";

//************************************************************** */

export type PlatformAuditEvent = {
  id: string;

  organizationId: string | null;
  actorUserId: string | null;

  action: string;
  resourceType: string;
  resourceId: string | null;

  ipAddress: string | null;
  userAgent: string | null;
  metadata: AuditJsonValue;
  createdAt: string;

  actorUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;

  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

//************************************************************** */

export type PlatformAuditListInput = {
  page: number;
  pageSize: number;
  scope: PlatformAuditScope;

  search?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorUserId?: string;
  organizationId?: string;

  createdFrom?: string;
  createdBefore?: string;
};

//************************************************************** */

export type PlatformAuditListResponse =
  PlatformPaginatedResponse<PlatformAuditEvent>;

//************************************************************** */