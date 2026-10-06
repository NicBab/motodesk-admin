"use client";

import {
  apiRequest,
} from "@/lib/api/api-client";

import type {
  PlatformUserDetail,
  PlatformUserListInput,
  PlatformUserListResponse,
  PlatformUserMembershipsInput,
  PlatformUserMembershipsResponse,
} from "./user.types";

//************************************************************** */

export async function getPlatformUsers(
  input: PlatformUserListInput,
  signal?: AbortSignal,
): Promise<PlatformUserListResponse> {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  if (input.search?.trim()) {
    params.set("search", input.search.trim());
  }

  // Preserve false so the Disabled filter works.
  if (input.isActive !== undefined) {
    params.set("isActive", String(input.isActive));
  }

  return apiRequest<PlatformUserListResponse>(
    `/platform/users?${params.toString()}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */

export async function getPlatformUser(
  userId: string,
  signal?: AbortSignal,
): Promise<PlatformUserDetail> {
  return apiRequest<PlatformUserDetail>(
    `/platform/users/${encodeURIComponent(userId)}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */

export async function getPlatformUserMemberships(
  input: PlatformUserMembershipsInput,
  signal?: AbortSignal,
): Promise<PlatformUserMembershipsResponse> {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  return apiRequest<PlatformUserMembershipsResponse>(
    `/platform/users/${encodeURIComponent(input.userId)}/memberships?${params.toString()}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */