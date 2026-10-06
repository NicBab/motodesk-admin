import type {
  PlatformMembership,
  PlatformPaginatedResponse,
} from "@/features/organizations/organization.types";

//************************************************************** */

export type PlatformUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;

  isActive: boolean;
  emailVerifiedAt: string | null;

  createdAt: string;
  updatedAt: string;

  activeMembershipCount: number;
};

//************************************************************** */

export type PlatformUserDetail = PlatformUser;

//************************************************************** */

export type PlatformUserListInput = {
  page: number;
  pageSize: number;

  search?: string;
  isActive?: boolean;
};

//************************************************************** */

export type PlatformUserListResponse =
  PlatformPaginatedResponse<PlatformUser>;

//************************************************************** */

export type PlatformUserMembershipsInput = {
  userId: string;
  page: number;
  pageSize: number;
};

//************************************************************** */

export type PlatformUserMembershipsResponse =
  PlatformPaginatedResponse<PlatformMembership>;

//************************************************************** */