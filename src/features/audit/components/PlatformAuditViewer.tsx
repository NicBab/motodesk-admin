"use client";

import { useEffect, useState } from "react";

import { Loader2, RefreshCw } from "lucide-react";

import {
  usePlatformSession,
} from "@/features/auth/PlatformSessionProvider";

import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/api/api-error";

import {
  getPlatformAuditLogs,
} from "../audit.api";

import type {
  PlatformAuditListInput,
  PlatformAuditListResponse,
} from "../audit.types";

import {
  EMPTY_PLATFORM_AUDIT_FILTERS,
  PlatformAuditFilters,
  type PlatformAuditFilterValues,
} from "./PlatformAuditFilters";

import {
  PlatformAuditEvents,
} from "./PlatformAuditEvents";

//************************************************************** */

type AuditResult = {
  requestKey: string;
  data: PlatformAuditListResponse | null;
  error: string | null;
};

//************************************************************** */

export function PlatformAuditViewer() {
  const { reloadSession } = usePlatformSession();

  const [draftFilters, setDraftFilters] =
    useState<PlatformAuditFilterValues>({
      ...EMPTY_PLATFORM_AUDIT_FILTERS,
    });

  const [filterError, setFilterError] =
    useState<string | null>(null);

  const [query, setQuery] = useState<PlatformAuditListInput>({
    page: 1,
    pageSize: 25,
    scope: "ALL",
  });

  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] =
    useState<AuditResult | null>(null);

  const requestKey =
    `${JSON.stringify(query)}:${refreshVersion}`;

  const currentResult =
    result?.requestKey === requestKey ? result : null;

  const isFetching = currentResult === null;

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();

    getPlatformAuditLogs(query, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) {
          return;
        }

        setResult({
          requestKey,
          data,
          error: null,
        });
      },
      (error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setResult({
          requestKey,
          data: null,
          error: getApiErrorMessage(
            error,
            "MotoDesk could not load platform audit events.",
          ),
        });

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          void reloadSession();
        }
      },
    );

    return () => controller.abort();
  }, [query, requestKey, reloadSession]);

  //************************************************************** */

  function refresh() {
    setRefreshVersion((current) => current + 1);
  }

  function applyFilters() {
    setFilterError(null);

    const {
      search,
      scope,
      organizationId,
      actorUserId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
    } = draftFilters;

    if (startDate && endDate && startDate > endDate) {
      setFilterError(
        "The through date must be on or after the from date.",
      );
      return;
    }

    try {
      setQuery({
        page: 1,
        pageSize: query.pageSize,
        scope,

        ...(search.trim()
          ? { search: search.trim() }
          : {}),

        ...(scope !== "UNASSIGNED" && organizationId.trim()
          ? { organizationId: organizationId.trim() }
          : {}),

        ...(actorUserId.trim()
          ? { actorUserId: actorUserId.trim() }
          : {}),

        ...(action.trim()
          ? { action: action.trim() }
          : {}),

        ...(resourceType.trim()
          ? { resourceType: resourceType.trim() }
          : {}),

        ...(resourceId.trim()
          ? { resourceId: resourceId.trim() }
          : {}),

        ...(startDate
          ? { createdFrom: utcDateBoundary(startDate, false) }
          : {}),

        ...(endDate
          ? { createdBefore: utcDateBoundary(endDate, true) }
          : {}),
      });
    } catch {
      setFilterError("Enter valid dates.");
    }
  }

  function resetFilters() {
    setDraftFilters({ ...EMPTY_PLATFORM_AUDIT_FILTERS });
    setFilterError(null);

    setQuery({
      page: 1,
      pageSize: query.pageSize,
      scope: "ALL",
    });
  }

  //************************************************************** */

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-xs leading-5 text-zinc-500">
          Review recorded events across organizations and events without
          an organization association. Visibility depends on the activity
          recorded by the existing audit infrastructure.
        </p>

        <button
          type="button"
          disabled={isFetching}
          onClick={refresh}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              isFetching ? "animate-spin" : "",
            ].join(" ")}
          />
          Refresh
        </button>
      </div>

      <PlatformAuditFilters
        values={draftFilters}
        error={filterError}
        onChange={(values) => {
          setDraftFilters(values);
          setFilterError(null);
        }}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {isFetching ? (
        <section
          role="status"
          className="flex min-h-56 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-500 shadow-sm"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading audit events…
        </section>
      ) : currentResult?.error ? (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm"
        >
          <p className="text-sm text-red-700">
            {currentResult.error}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-4 text-sm font-semibold text-orange-600"
          >
            Try Again
          </button>
        </section>
      ) : currentResult?.data ? (
        <PlatformAuditEvents
          key={requestKey}
          data={currentResult.data}
          isFetching={isFetching}
          onPageChange={(page) =>
            setQuery((current) => ({ ...current, page }))
          }
          onPageSizeChange={(pageSize) =>
            setQuery((current) => ({
              ...current,
              page: 1,
              pageSize,
            }))
          }
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function utcDateBoundary(
  value: string,
  nextDay: boolean,
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid date.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("Invalid date.");
  }

  if (nextDay) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date.toISOString();
}

//************************************************************** */