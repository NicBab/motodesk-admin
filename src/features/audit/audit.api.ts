"use client";

import {
  apiRequest,
} from "@/lib/api/api-client";

import type {
  PlatformAuditListInput,
  PlatformAuditListResponse,
} from "./audit.types";

//************************************************************** */

export async function getPlatformAuditLogs(
  input: PlatformAuditListInput,
  signal?: AbortSignal,
): Promise<PlatformAuditListResponse> {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
    scope: input.scope,
  });

  const optionalFilters = {
    search: input.search,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    actorUserId: input.actorUserId,
    organizationId: input.organizationId,
    createdFrom: input.createdFrom,
    createdBefore: input.createdBefore,
  };

  for (const [key, value] of Object.entries(optionalFilters)) {
    if (value !== undefined && value.trim() !== "") {
      params.set(key, value.trim());
    }
  }

  return apiRequest<PlatformAuditListResponse>(
    `/platform/audit?${params.toString()}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */