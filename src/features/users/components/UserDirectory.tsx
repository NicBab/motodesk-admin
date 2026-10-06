"use client";

import { useEffect, useState, type FormEvent } from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

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

import { getPlatformUsers } from "../user.api";

import type {
  PlatformUserListInput,
  PlatformUserListResponse,
} from "../user.types";

//************************************************************** */

type AccountFilter = "" | "enabled" | "disabled";

type DirectoryResult = {
  requestKey: string;
  data: PlatformUserListResponse | null;
  error: string | null;
};

const inputClasses =
  "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

export function UserDirectory() {
  const { reloadSession } = usePlatformSession();

  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] =
    useState<AccountFilter>("");

  const [query, setQuery] = useState<PlatformUserListInput>({
    page: 1,
    pageSize: 25,
  });

  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] =
    useState<DirectoryResult | null>(null);

  const requestKey =
    `${JSON.stringify(query)}:${refreshVersion}`;

  const currentResult =
    result?.requestKey === requestKey ? result : null;

  const isFetching = currentResult === null;
  const data = currentResult?.data;

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();

    getPlatformUsers(query, controller.signal).then(
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
            "MotoDesk could not load user accounts.",
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

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setQuery({
      page: 1,
      pageSize: query.pageSize,

      ...(search.trim()
        ? { search: search.trim() }
        : {}),

      ...(accountFilter
        ? { isActive: accountFilter === "enabled" }
        : {}),
    });
  }

  function resetFilters() {
    setSearch("");
    setAccountFilter("");

    setQuery({
      page: 1,
      pageSize: query.pageSize,
    });
  }

  function refresh() {
    setRefreshVersion((current) => current + 1);
  }

  //************************************************************** */

  return (
    <div className="space-y-6">
      <form
        onSubmit={applyFilters}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <label className="block min-w-56 flex-1">
          <span className="mb-2 block text-xs font-medium text-zinc-500">
            Search Users
          </span>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />

            <input
              type="search"
              maxLength={200}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="First name, last name, email, or user ID"
              className={`${inputClasses} w-full pl-9`}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-500">
            Account Status
          </span>

          <select
            value={accountFilter}
            onChange={(event) =>
              setAccountFilter(event.target.value as AccountFilter)
            }
            className={inputClasses}
          >
            <option value="">All accounts</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>

        <button
          type="submit"
          className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={resetFilters}
          className="h-10 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
        >
          Reset
        </button>

        <button
          type="button"
          aria-label="Refresh users"
          disabled={isFetching}
          onClick={refresh}
          className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              isFetching ? "animate-spin" : "",
            ].join(" ")}
          />
        </button>
      </form>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <header className="border-b border-zinc-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            User Directory
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            {data
              ? `${data.pagination.totalItems.toLocaleString()} matching user accounts`
              : "Unique user accounts across MotoDesk"}
          </p>
        </header>

        {isFetching ? (
          <div
            role="status"
            className="flex min-h-56 items-center justify-center gap-2 text-sm text-zinc-500"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : currentResult?.error ? (
          <div role="alert" className="p-8 text-center">
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
          </div>
        ) : data ? (
          <>
            {data.items.length === 0 ? (
              <div className="py-14 text-center">
                <Users className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-3 text-sm font-semibold text-zinc-800">
                  No matching users
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Adjust your search or account-status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <caption className="sr-only">
                    User accounts, verification, and organization memberships
                  </caption>

                  <thead className="bg-zinc-50 text-xs text-zinc-500">
                    <tr>
                      {[
                        "User",
                        "Account",
                        "Email Verification",
                        "Active Memberships",
                        "Registered",
                        "Details",
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
                    {data.items.map((user) => {
                      const name = [
                        user.firstName,
                        user.lastName,
                      ].filter(Boolean).join(" ");

                      const href =
                        `/users/${encodeURIComponent(user.id)}`;

                      return (
                        <tr key={user.id}>
                          <td className="px-5 py-4">
                            <Link
                              href={href}
                              className="font-semibold text-zinc-900 hover:text-orange-600"
                            >
                              {name || user.email}
                            </Link>

                            <p className="mt-1 text-xs text-zinc-500">
                              {user.email}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={[
                                "rounded-full px-2 py-1 text-xs font-semibold",
                                user.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-zinc-100 text-zinc-500",
                              ].join(" ")}
                            >
                              {user.isActive ? "Enabled" : "Disabled"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-xs text-zinc-600">
                            {user.emailVerifiedAt
                              ? "Verified"
                              : "Unverified"}
                          </td>

                          <td className="px-5 py-4 tabular-nums text-zinc-700">
                            {user.activeMembershipCount.toLocaleString()}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">
                            {formatDate(user.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <Link
                              href={href}
                              aria-label={`View ${name || user.email}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                            >
                              View
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
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
          </>
        ) : null}
      </section>

      <p className="text-xs text-zinc-400">
        Enabled accounts can sign in. This does not measure recent activity.
        Active memberships count organization assignments.
      </p>
    </div>
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