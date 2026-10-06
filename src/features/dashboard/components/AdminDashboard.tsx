"use client";

import { useEffect, useState } from "react";

import {
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import {
  usePlatformSession,
} from "@/features/auth/PlatformSessionProvider";

import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/api/api-error";

import {
  getPlatformDashboard,
} from "../dashboard.api";

import type {
  PlatformDashboardData,
  PlatformDateRangeInput,
} from "../dashboard.types";

import {
  createDashboardRange,
  DashboardDateRange,
} from "./DashboardDateRange";

import {
  DashboardMetricCards,
} from "./DashboardMetricCards"

import {
  DashboardGrowthChart,
} from "./DashboardGrowthChart";

//************************************************************** */

type DashboardResult = {
  requestKey: string;
  data: PlatformDashboardData | null;
  error: string | null;
  accessDenied: boolean;
};

//************************************************************** */

export function AdminDashboard() {
  const { reloadSession } = usePlatformSession();

  const [range, setRange] = useState<PlatformDateRangeInput>(
    () => createDashboardRange(),
  );

  const [refreshVersion, setRefreshVersion] = useState(0);

  const [result, setResult] =
    useState<DashboardResult | null>(null);

  const requestKey =
    `${range.from}:${range.before}:${refreshVersion}`;

  const currentResult =
    result?.requestKey === requestKey
      ? result
      : null;

  const isFetching = currentResult === null;

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();

    getPlatformDashboard(range, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) {
          return;
        }

        setResult({
          requestKey,
          data,
          error: null,
          accessDenied: false,
        });
      },
      (error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        const accessDenied =
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403);

        setResult({
          requestKey,
          data: null,
          error: getApiErrorMessage(
            error,
            "MotoDesk could not load platform metrics.",
          ),
          accessDenied,
        });

        if (accessDenied) {
          void reloadSession();
        }
      },
    );

    return () => {
      controller.abort();
    };
  }, [range, requestKey, reloadSession]);

  //************************************************************** */

  function refresh() {
    setRefreshVersion((current) => current + 1);
  }

  function changeRange(nextRange: PlatformDateRangeInput) {
    if (
      nextRange.from === range.from &&
      nextRange.before === range.before
    ) {
      refresh();
      return;
    }

    setRange(nextRange);
  }

  //************************************************************** */

  return (
    <div className="space-y-6">
      <DashboardDateRange
        key={`${range.from}:${range.before}`}
        range={range}
        isFetching={isFetching}
        onChange={changeRange}
        onRefresh={refresh}
      />

      {isFetching ? (
        <section
          role="status"
          className="flex min-h-64 items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading platform metrics…
        </section>
      ) : currentResult?.error ? (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm"
        >
          <ShieldAlert className="mx-auto h-8 w-8 text-red-400" />

          <h2 className="mt-3 text-sm font-semibold text-zinc-900">
            {currentResult.accessDenied
              ? "Platform Access Must Be Verified"
              : "Dashboard Unavailable"}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {currentResult.error}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </section>
      ) : currentResult?.data ? (
        <>
          <DashboardMetricCards
            overview={currentResult.data.overview}
          />

          <DashboardGrowthChart
            key={`${range.from}:${range.before}`}
            growth={currentResult.data.growth}
          />

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">
              Metric Definitions
            </h2>

            <div className="mt-3 grid gap-4 text-xs leading-5 text-zinc-500 md:grid-cols-3">
              <p>
                Organization status describes whether a shop is active or
                archived. It does not indicate a paid subscription.
              </p>

              <p>
                Enabled user accounts can sign in. This count does not measure
                daily or monthly active users.
              </p>

              <p>
                Active memberships count organization assignments. One user
                can belong to multiple organizations.
              </p>
            </div>
          </section>

          <p className="text-xs text-zinc-400">
            Overview generated{" "}
            {formatTimestamp(
              currentResult.data.overview.generatedAt,
            )}
            . Overview and growth are retrieved separately.
          </p>
        </>
      ) : null}
    </div>
  );
}

//************************************************************** */

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "at an unknown time";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

//************************************************************** */