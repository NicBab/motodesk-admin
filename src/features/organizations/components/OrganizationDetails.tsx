"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Building2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  usePlatformSession,
} from "@/features/auth/PlatformSessionProvider";

import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/api/api-error";

import {
  getPlatformOrganization,
} from "../organization.api";

import type {
  PlatformOrganizationDetail,
} from "../organization.types";

import {
  OrganizationMemberships,
} from "./OrganizationMemberships";
import Link from "next/link";

//************************************************************** */

type DetailResult = {
  requestKey: string;
  data: PlatformOrganizationDetail | null;
  error: string | null;
};

//************************************************************** */

export function OrganizationDetails({
  organizationId,
}: {
  organizationId: string;
}) {
  const { reloadSession } = usePlatformSession();

  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] =
    useState<DetailResult | null>(null);

  const requestKey = `${organizationId}:${refreshVersion}`;

  const currentResult =
    result?.requestKey === requestKey ? result : null;

  const organization = currentResult?.data;
  const isFetching = currentResult === null;

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();

    getPlatformOrganization(
      organizationId,
      controller.signal,
    ).then(
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
            "MotoDesk could not load this organization.",
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
  }, [organizationId, requestKey, reloadSession]);

  //************************************************************** */

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/organizations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Organizations
        </Link>

        <button
          type="button"
          disabled={isFetching}
          onClick={() => setRefreshVersion((current) => current + 1)}
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

      {isFetching ? (
        <section
          role="status"
          className="flex min-h-56 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-500"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading organization…
        </section>
      ) : currentResult?.error ? (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-700"
        >
          {currentResult.error}
        </section>
      ) : organization ? (
        <>
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-500">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold text-zinc-900">
                    {organization.name}
                  </h2>

                  <p className="mt-1 break-words text-xs text-zinc-500">
                    {organization.slug}
                  </p>
                </div>
              </div>

              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  organization.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500",
                ].join(" ")}
              >
                {organization.status === "ACTIVE" ? "Active" : "Archived"}
              </span>
            </div>

            <dl className="mt-6 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Organization ID" value={organization.id} />
              <DetailField label="Email" value={organization.email} />
              <DetailField label="Phone" value={organization.phone} />

              <DetailField
                label="Registered (UTC)"
                value={formatTimestamp(organization.createdAt)}
              />

              <DetailField
                label="Last Updated (UTC)"
                value={formatTimestamp(organization.updatedAt)}
              />

              <DetailField
                label="Subscription"
                value="Not configured"
              />
            </dl>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">
              Organization Records
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Current record counts, including archived records where retained.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Active Members", organization.activeMembershipCount],
                ["Customers", organization.recordCounts.customers],
                ["Vehicles", organization.recordCounts.vehicles],
                ["Repair Orders", organization.recordCounts.repairOrders],
                ["Parts", organization.recordCounts.parts],
                ["Purchase Orders", organization.recordCounts.purchaseOrders],
                ["Sales", organization.recordCounts.sales],
              ].map(([label, count]) => (
                <div
                  key={label}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
                >
                  <p className="text-xs text-zinc-500">{label}</p>

                  <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900">
                    {typeof count === "number"
                      ? count.toLocaleString()
                      : count}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <OrganizationMemberships
            key={requestKey}
            organizationId={organizationId}
          />
        </>
      ) : null}
    </div>
  );
}

//************************************************************** */

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-zinc-500">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm text-zinc-800">
        {value || "Not recorded"}
      </dd>
    </div>
  );
}

//************************************************************** */

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

//************************************************************** */