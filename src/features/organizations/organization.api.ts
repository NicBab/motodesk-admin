"use client";

import {
  apiRequest,
} from "@/lib/api/api-client";

import type {
  PlatformMembership,
  PlatformOrganization,
  PlatformOrganizationDetail,
  PlatformOrganizationListInput,
  PlatformOrganizationMembershipsInput,
  PlatformPaginatedResponse,
} from "./organization.types";

//************************************************************** */

export async function getPlatformOrganizations(
  input: PlatformOrganizationListInput,
  signal?: AbortSignal,
): Promise<PlatformPaginatedResponse<PlatformOrganization>> {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  if (input.search?.trim()) {
    params.set("search", input.search.trim());
  }

  if (input.status !== undefined) {
    params.set("status", input.status);
  }

  return apiRequest<
    PlatformPaginatedResponse<PlatformOrganization>
  >(
    `/platform/organizations?${params.toString()}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */

export async function getPlatformOrganization(
  organizationId: string,
  signal?: AbortSignal,
): Promise<PlatformOrganizationDetail> {
  return apiRequest<PlatformOrganizationDetail>(
    `/platform/organizations/${encodeURIComponent(organizationId)}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */

export async function getPlatformOrganizationMemberships(
  input: PlatformOrganizationMembershipsInput,
  signal?: AbortSignal,
): Promise<PlatformPaginatedResponse<PlatformMembership>> {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  return apiRequest<
    PlatformPaginatedResponse<PlatformMembership>
  >(
    `/platform/organizations/${encodeURIComponent(input.organizationId)}/memberships?${params.toString()}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */