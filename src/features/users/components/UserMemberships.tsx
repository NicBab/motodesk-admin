"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Building2, Loader2 } from "lucide-react";

import {
  DirectoryPagination,
} from "@/components/ui/DirectoryPagination";

import {
  usePlatformSession,
} from "@/features/auth/PlatformSessionProvider";

import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/api/api-error";

import {
  getPlatformUserMemberships,
} from "../user.api";

import type {
  PlatformUserMembershipsResponse,
} from "../user.types";

//************************************************************** */

type MembershipResult = {
  requestKey: string;
  data: PlatformUserMembershipsResponse | null;
  error: string | null;
};

//************************************************************** */

export function UserMemberships({
  userId,
}: {
  userId: string;
}) {
  const { reloadSession } = usePlatformSession();

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
  });

  const [refreshVersion, setRefreshVersion] = useState(0);

  const [result, setResult] =
    useState<MembershipResult | null>(null);

  const { page, pageSize } = pagination;

  const requestKey =
    `${userId}:${page}:${pageSize}:${refreshVersion}`;

  const currentResult =
    result?.requestKey === requestKey ? result : null;

  const isFetching = currentResult === null;
  const data = currentResult?.data;

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();

    getPlatformUserMemberships(
      { userId, page, pageSize },
      controller.signal,
    ).then(
      (response) => {
        if (controller.signal.aborted) {
          return;
        }

        setResult({
          requestKey,
          data: response,
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
            "MotoDesk could not load this user's memberships.",
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
  }, [userId, page, pageSize, requestKey, reloadSession]);

  //************************************************************** */

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Building2 className="h-4 w-4 text-zinc-400" />
          Organization Memberships
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Organization assignments for this user. Removed memberships are
          excluded; organization and membership statuses are shown separately.
        </p>
      </header>

      {isFetching ? (
        <div
          role="status"
          className="flex min-h-48 items-center justify-center gap-2 text-sm text-zinc-500"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading memberships…
        </div>
      ) : currentResult?.error ? (
        <div role="alert" className="p-8 text-center">
          <p className="text-sm text-red-700">
            {currentResult.error}
          </p>

          <button
            type="button"
            onClick={() =>
              setRefreshVersion((current) => current + 1)
            }
            className="mt-4 text-sm font-semibold text-orange-600"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <>
          {data.items.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-500">
              No memberships are available for this user.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <caption className="sr-only">
                  User organization assignments, roles, and membership status
                </caption>

                <thead className="bg-zinc-50 text-xs text-zinc-500">
                  <tr>
                    {[
                      "Organization",
                      "Organization Status",
                      "Role",
                      "Membership",
                      "Joined",
                    ].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="px-5 py-3 font-medium"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {data.items.map((membership) => (
                    <tr key={membership.id}>
                      <td className="px-5 py-4">
                        <Link
                          href={`/organizations/${encodeURIComponent(membership.organization.id)}`}
                          className="font-semibold text-zinc-900 hover:text-orange-600"
                        >
                          {membership.organization.name}
                        </Link>

                        <p className="mt-1 text-xs text-zinc-500">
                          {membership.organization.slug}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-600">
                        {membership.organization.status === "ACTIVE"
                          ? "Active"
                          : "Archived"}
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-600">
                        {membership.role.replaceAll("_", " ")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-2 py-1 text-xs font-semibold",
                            membership.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : membership.status === "SUSPENDED"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-zinc-100 text-zinc-600",
                          ].join(" ")}
                        >
                          {membership.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">
                        {formatDate(membership.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DirectoryPagination
            pagination={data.pagination}
            itemCount={data.items.length}
            isFetching={isFetching}
            onPageChange={(nextPage) =>
              setPagination((current) => ({
                ...current,
                page: nextPage,
              }))
            }
            onPageSizeChange={(nextPageSize) =>
              setPagination({
                page: 1,
                pageSize: nextPageSize,
              })
            }
          />
        </>
      ) : null}
    </section>
  );
}

//************************************************************** */

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

//************************************************************** */