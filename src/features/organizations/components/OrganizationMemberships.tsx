"use client";

import { useEffect, useState } from "react";

import { Loader2, Users } from "lucide-react";

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
  getPlatformOrganizationMemberships,
} from "../organization.api";

import type {
  PlatformMembership,
  PlatformPaginatedResponse,
} from "../organization.types";

//************************************************************** */

type MembershipResult = {
  requestKey: string;
  data: PlatformPaginatedResponse<PlatformMembership> | null;
  error: string | null;
};

//************************************************************** */

export function OrganizationMemberships({
  organizationId,
}: {
  organizationId: string;
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
    `${organizationId}:${page}:${pageSize}:${refreshVersion}`;

  const currentResult =
    result?.requestKey === requestKey ? result : null;

  const isFetching = currentResult === null;
  const data = currentResult?.data;

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();

    getPlatformOrganizationMemberships(
      {
        organizationId,
        page,
        pageSize,
      },
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
            "MotoDesk could not load organization memberships.",
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
  }, [
    organizationId,
    page,
    pageSize,
    requestKey,
    reloadSession,
  ]);

  //************************************************************** */

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Users className="h-4 w-4 text-zinc-400" />
          Organization Memberships
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Active, invited, and suspended memberships. Removed memberships
          are excluded; pending invitations are separate records.
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
              No memberships are available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <caption className="sr-only">
                  Organization members and their account access status
                </caption>

                <thead className="bg-zinc-50 text-xs text-zinc-500">
                  <tr>
                    {[
                      "User",
                      "Role",
                      "Membership",
                      "Account",
                      "Email",
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
                  {data.items.map((membership) => {
                    const name = [
                      membership.user.firstName,
                      membership.user.lastName,
                    ].filter(Boolean).join(" ");

                    return (
                      <tr key={membership.id}>
                        <td className="px-5 py-4">
                          <a
                            href={`/users/${encodeURIComponent(membership.user.id)}`}
                            className="font-semibold text-zinc-900 hover:text-orange-600"
                          >
                            {name || membership.user.email}
                          </a>

                          <p className="mt-1 text-xs text-zinc-500">
                            {membership.user.email}
                          </p>
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

                        <td className="px-5 py-4 text-xs text-zinc-600">
                          {membership.user.isActive
                            ? "Enabled"
                            : "Disabled"}
                        </td>

                        <td className="px-5 py-4 text-xs text-zinc-600">
                          {membership.user.emailVerifiedAt
                            ? "Verified"
                            : "Unverified"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">
                          {formatDate(membership.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
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