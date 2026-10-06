//************************************************************** */

export type OrganizationStatus =
  | "ACTIVE"
  | "ARCHIVED";

export type MembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "SERVICE_ADVISOR"
  | "TECHNICIAN"
  | "PARTS";

export type MembershipStatus =
  | "INVITED"
  | "ACTIVE"
  | "SUSPENDED"
  | "REMOVED";

//************************************************************** */

export type PlatformPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PlatformPaginatedResponse<T> = {
  items: T[];
  pagination: PlatformPagination;
};

//************************************************************** */

export type OrganizationSubscriptionUnavailable = {
  status: "NOT_CONFIGURED";
  plan: null;
  currentPeriodEnd: null;
};

//************************************************************** */

export type PlatformOrganization = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: OrganizationStatus;

  createdAt: string;
  updatedAt: string;

  activeMembershipCount: number;
  subscription: OrganizationSubscriptionUnavailable;
};

//************************************************************** */

export type PlatformOrganizationDetail = PlatformOrganization & {
  recordCounts: {
    customers: number;
    vehicles: number;
    repairOrders: number;
    parts: number;
    purchaseOrders: number;
    sales: number;
  };
};

//************************************************************** */

export type PlatformOrganizationListInput = {
  page: number;
  pageSize: number;
  search?: string;
  status?: OrganizationStatus;
};

//************************************************************** */

export type PlatformMembershipUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;

  isActive: boolean;
  emailVerifiedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type PlatformMembership = {
  id: string;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: string;

  user: PlatformMembershipUser;

  organization: {
    id: string;
    name: string;
    slug: string;
    status: OrganizationStatus;
  };
};

//************************************************************** */

export type PlatformOrganizationMembershipsInput = {
  organizationId: string;
  page: number;
  pageSize: number;
};

//************************************************************** */