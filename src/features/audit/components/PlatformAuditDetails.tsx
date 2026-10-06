import Link from "next/link";

import type {
  AuditJsonValue,
  PlatformAuditEvent,
} from "../audit.types";

//************************************************************** */

export function PlatformAuditDetails({
  event,
}: {
  event: PlatformAuditEvent;
}) {
  const actorName = event.actorUser
    ? [
        event.actorUser.firstName,
        event.actorUser.lastName,
      ].filter(Boolean).join(" ")
    : event.actorUserId
      ? "Unavailable user"
      : "System / unspecified actor";

  return (
    <div className="space-y-5 bg-zinc-50/70 p-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">
          Event Details
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Recorded context and sanitized event metadata.
        </p>
      </div>

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Event ID" value={event.id} mono />

        <DetailField
          label="Recorded At (UTC)"
          value={formatTimestamp(event.createdAt)}
        />

        <DetailField label="Action" value={event.action} mono />

        <div className="min-w-0">
          <dt className="text-xs font-medium text-zinc-500">
            Organization
          </dt>

          <dd className="mt-1 break-words text-sm text-zinc-800">
            {event.organization ? (
              <Link
                href={`/organizations/${encodeURIComponent(event.organization.id)}`}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                {event.organization.name}
              </Link>
            ) : event.organizationId ? (
              "Unavailable organization"
            ) : (
              "Unassigned"
            )}
          </dd>
        </div>

        <DetailField
          label="Organization ID"
          value={event.organizationId}
          mono
        />

        <DetailField
          label="Resource Type"
          value={event.resourceType}
        />

        <DetailField
          label="Resource ID"
          value={event.resourceId}
          mono
        />

        <div className="min-w-0">
          <dt className="text-xs font-medium text-zinc-500">
            Actor
          </dt>

          <dd className="mt-1 break-words text-sm text-zinc-800">
            {event.actorUser ? (
              <Link
                href={`/users/${encodeURIComponent(event.actorUser.id)}`}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                {actorName || event.actorUser.email}
              </Link>
            ) : (
              actorName
            )}
          </dd>
        </div>

        <DetailField
          label="Actor Email"
          value={event.actorUser?.email}
        />

        <DetailField
          label="Actor User ID"
          value={event.actorUserId}
          mono
        />

        <DetailField
          label="IP Address"
          value={event.ipAddress}
          mono
        />

        <DetailField
          label="User Agent"
          value={event.userAgent}
        />
      </dl>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Metadata
        </h4>

        <div className="mt-3">
          {event.metadata === null ? (
            <p className="text-sm text-zinc-500">
              No metadata was recorded.
            </p>
          ) : (
            <MetadataValue value={event.metadata} />
          )}
        </div>
      </section>
    </div>
  );
}

//************************************************************** */

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-zinc-500">
        {label}
      </dt>

      <dd
        className={[
          "mt-1 whitespace-pre-wrap break-words text-sm text-zinc-800",
          mono ? "font-mono text-xs" : "",
        ].join(" ")}
      >
        {value || "Not recorded"}
      </dd>
    </div>
  );
}

//************************************************************** */

function MetadataValue({
  value,
}: {
  value: AuditJsonValue;
}) {
  if (value === null) {
    return <span className="text-xs text-zinc-500">null</span>;
  }

  if (typeof value !== "object") {
    const displayed =
      typeof value === "string" ? value : String(value);

    return (
      <span
        className={[
          "whitespace-pre-wrap break-words text-xs",
          displayed === "[REDACTED]"
            ? "font-medium text-amber-700"
            : "text-zinc-700",
        ].join(" ")}
      >
        {displayed === "" ? "(empty string)" : displayed}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="text-xs text-zinc-500">
          Empty list
        </span>
      );
    }

    return (
      <ol className="space-y-3">
        {value.map((item, index) => (
          <li
            key={index}
            className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50/50 p-3"
          >
            <p className="mb-2 text-xs font-medium text-zinc-500">
              Item {index + 1}
            </p>

            <MetadataValue value={item} />
          </li>
        ))}
      </ol>
    );
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return (
      <span className="text-xs text-zinc-500">
        No additional details
      </span>
    );
  }

  return (
    <dl className="space-y-3">
      {entries.map(([key, entry]) => (
        <div
          key={key}
          className="min-w-0 border-l-2 border-zinc-200 pl-3"
        >
          <dt className="break-words text-xs font-semibold text-zinc-800">
            {key}
          </dt>

          <dd className="mt-1 min-w-0">
            <MetadataValue value={entry} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

//************************************************************** */

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

//************************************************************** */