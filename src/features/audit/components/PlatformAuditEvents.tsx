"use client";

import { Fragment, useState } from "react";

import Link from "next/link";

import { ChevronDown, ScrollText } from "lucide-react";

import {
  DirectoryPagination,
} from "@/components/ui/DirectoryPagination";

import type {
  PlatformAuditListResponse,
} from "../audit.types";

import {
  PlatformAuditDetails,
} from "./PlatformAuditDetails";

//************************************************************** */

export function PlatformAuditEvents({
  data,
  isFetching,
  onPageChange,
  onPageSizeChange,
}: {
  data: PlatformAuditListResponse;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const [expandedEventId, setExpandedEventId] =
    useState<string | null>(null);

  return (
    <section
      aria-label="Platform audit events"
      aria-busy={isFetching}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
    >
      <header className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">
          Recorded Events
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          {data.pagination.totalItems.toLocaleString()} matching events
          {" · "}Newest first
        </p>
      </header>

      {data.items.length === 0 ? (
        <div className="py-14 text-center">
          <ScrollText className="mx-auto h-8 w-8 text-zinc-300" />

          <h3 className="mt-3 text-sm font-semibold text-zinc-800">
            No matching events
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Adjust your filters or refresh to check for new activity.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <caption className="sr-only">
              Platform audit events. Expand an event to inspect its context.
            </caption>

            <thead className="bg-zinc-50 text-xs text-zinc-500">
              <tr>
                {[
                  "Timestamp (UTC)",
                  "Organization",
                  "Actor",
                  "Action / Event",
                  "Resource",
                  "IP Address",
                  "Details",
                ].map((label) => (
                  <th
                    key={label}
                    scope="col"
                    className="px-4 py-3 font-medium"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {data.items.map((event) => {
                const expanded = expandedEventId === event.id;

                const actorName = event.actorUser
                  ? [
                      event.actorUser.firstName,
                      event.actorUser.lastName,
                    ].filter(Boolean).join(" ")
                  : event.actorUserId
                    ? "Unavailable user"
                    : "System / unspecified";

                return (
                  <Fragment key={event.id}>
                    <tr className={expanded ? "bg-orange-50/40" : ""}>
                      <td className="whitespace-nowrap px-4 py-4 align-top text-xs text-zinc-600">
                        <time
                          dateTime={event.createdAt}
                          title={event.createdAt}
                        >
                          {formatTimestamp(event.createdAt)}
                        </time>
                      </td>

                      <td className="px-4 py-4 align-top">
                        {event.organization ? (
                          <Link
                            href={`/organizations/${encodeURIComponent(event.organization.id)}`}
                            className="font-medium text-zinc-800 hover:text-orange-600"
                          >
                            {event.organization.name}
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            {event.organizationId
                              ? "Unavailable organization"
                              : "Unassigned"}
                          </span>
                        )}

                        <p className="mt-1 max-w-48 break-all text-xs text-zinc-400">
                          {event.organization?.slug ?? event.organizationId}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        {event.actorUser ? (
                          <Link
                            href={`/users/${encodeURIComponent(event.actorUser.id)}`}
                            className="font-medium text-zinc-800 hover:text-orange-600"
                          >
                            {actorName || event.actorUser.email}
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            {actorName}
                          </span>
                        )}

                        <p className="mt-1 max-w-48 break-all text-xs text-zinc-400">
                          {event.actorUser?.email ?? event.actorUserId}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span className="inline-block rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700">
                          {event.action}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="text-xs font-medium text-zinc-800">
                          {event.resourceType}
                        </p>

                        <p className="mt-1 max-w-48 break-all font-mono text-xs text-zinc-400">
                          {event.resourceId ?? "No identifier"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-zinc-500">
                        {event.ipAddress ?? "Not recorded"}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`platform-audit-${event.id}`}
                          aria-label={`${expanded ? "Hide" : "Show"} details for ${event.action} at ${event.createdAt}`}
                          onClick={() =>
                            setExpandedEventId(expanded ? null : event.id)
                          }
                          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100"
                        >
                          {expanded ? "Hide" : "View"}

                          <ChevronDown
                            className={[
                              "h-3.5 w-3.5 transition-transform",
                              expanded ? "rotate-180" : "",
                            ].join(" ")}
                          />
                        </button>
                      </td>
                    </tr>

                    <tr hidden={!expanded}>
                      <td colSpan={7} className="p-0">
                        <div id={`platform-audit-${event.id}`}>
                          {expanded ? (
                            <PlatformAuditDetails event={event} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
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
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </section>
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
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

//************************************************************** */