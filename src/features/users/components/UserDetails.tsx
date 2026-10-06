"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  usePlatformSession,
} from "@/features/auth/PlatformSessionProvider";

import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/api/api-error";

import { getPlatformUser } from "../user.api";

import type {
  PlatformUserDetail,
} from "../user.types";

import { UserMemberships } from "./UserMemberships";

//************************************************************** */

type DetailResult = {
  requestKey: string;
  data: PlatformUserDetail | null;
  error: string | null;
};

//************************************************************** */

export function UserDetails({
  userId,
}: {
  userId: string;
}) {
  const { reloadSession } = usePlatformSession();

  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] =
    useState<DetailResult | null>(null);

  const requestKey = `${userId}:${refreshVersion}`;

  const currentResult =
    result?.requestKey === requestKey ? result : null;

  const user = currentResult?.data;
  const isFetching = currentResult === null;

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();

    getPlatformUser(userId, controller.signal).then(
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
            "MotoDesk could not load this user account.",
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
  }, [userId, requestKey, reloadSession]);

  //************************************************************** */

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>

        <button
          type="button"
          disabled={isFetching}
          onClick={() =>
            setRefreshVersion((current) => current + 1)
          }
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
          Loading user account…
        </section>
      ) : currentResult?.error ? (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-700"
        >
          {currentResult.error}
        </section>
      ) : user ? (
        <>
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-500">
                  <UserRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold text-zinc-900">
                    {displayName || user.email}
                  </h2>

                  <p className="mt-1 break-all text-xs text-zinc-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  user.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500",
                ].join(" ")}
              >
                {user.isActive ? "Enabled" : "Disabled"}
              </span>
            </div>

            <dl className="mt-6 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="User ID" value={user.id} />

              <DetailField
                label="First Name"
                value={user.firstName}
              />

              <DetailField
                label="Last Name"
                value={user.lastName}
              />

              <DetailField
                label="Email Verification"
                value={
                  user.emailVerifiedAt
                    ? `Verified ${formatTimestamp(user.emailVerifiedAt)} UTC`
                    : "Unverified"
                }
              />

              <DetailField
                label="Registered (UTC)"
                value={formatTimestamp(user.createdAt)}
              />

              <DetailField
                label="Last Updated (UTC)"
                value={formatTimestamp(user.updatedAt)}
              />

              <DetailField
                label="Active Memberships"
                value={user.activeMembershipCount.toLocaleString()}
              />
            </dl>
          </section>

          <UserMemberships
            key={requestKey}
            userId={userId}
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
  value: string;
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