//************************************************************** */

export type PlatformAdminRole =
  | "SUPER_ADMIN"
  | "ADMIN";

//************************************************************** */

export type OrganizationMembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "SERVICE_ADVISOR"
  | "TECHNICIAN"
  | "PARTS";

export type OrganizationMembershipStatus =
  | "INVITED"
  | "ACTIVE"
  | "SUSPENDED"
  | "REMOVED";

//************************************************************** */

export type AuthenticatedUser = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;

  firstName: string;
  lastName: string;

  phone: string | null;
  jobTitle: string | null;
  preferredTimezone: string;
  displayMode: string;
  isActive: boolean;
};

//************************************************************** */

export type AuthenticatedMembership = {
  id: string;
  organizationId: string;
  organizationName: string;

  role: OrganizationMembershipRole;
  status: OrganizationMembershipStatus;
};

//************************************************************** */

// The existing /auth/login response establishes the session.
// It does not establish platform administrator authorization.
export type LoginResponse = {
  user: AuthenticatedUser;
  membership: AuthenticatedMembership | null;
  permissions: string[];

  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};

//************************************************************** */

export type LoginInput = {
  email: string;
  password: string;
};

//************************************************************** */

// Returned by /platform/me after checking the live platform grant.
export type PlatformSession = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerifiedAt: string | null;
  };

  platformAdmin: {
    id: string;
    role: PlatformAdminRole;
  };
};

//************************************************************** */