"use client";

import { apiRequest } from "@/lib/api/api-client";

import type {
  PlatformDashboardData,
  PlatformDateRangeInput,
  PlatformGrowth,
  PlatformOverview,
} from "./dashboard.types";

//************************************************************** */

function rangeQuery(
  range: PlatformDateRangeInput,
): string {
  return new URLSearchParams({
    from: range.from,
    before: range.before,
  }).toString();
}

//************************************************************** */

export async function getPlatformOverview(
  range: PlatformDateRangeInput,
  signal?: AbortSignal,
): Promise<PlatformOverview> {
  return apiRequest<PlatformOverview>(
    `/platform/overview?${rangeQuery(range)}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */

export async function getPlatformGrowth(
  range: PlatformDateRangeInput,
  signal?: AbortSignal,
): Promise<PlatformGrowth> {
  return apiRequest<PlatformGrowth>(
    `/platform/growth?${rangeQuery(range)}`,
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */

export async function getPlatformDashboard(
  range: PlatformDateRangeInput,
  signal?: AbortSignal,
): Promise<PlatformDashboardData> {
  const [overview, growth] = await Promise.all([
    getPlatformOverview(range, signal),
    getPlatformGrowth(range, signal),
  ]);

  return {
    overview,
    growth,
  };
}

//************************************************************** */