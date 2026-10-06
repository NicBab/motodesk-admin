import {
  Building2,
  CreditCard,
  DollarSign,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import type {
  PlatformOverview,
} from "../dashboard.types";

//************************************************************** */

export function DashboardMetricCards({
  overview,
}: {
  overview: PlatformOverview;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        label="Organizations"
        value={overview.organizations.total}
        icon={Building2}
        description={`${formatCount(overview.organizations.active)} active · ${formatCount(overview.organizations.archived)} archived`}
        note={`${formatCount(overview.organizations.newInRange)} registered in the reporting period`}
      />

      <MetricCard
        label="User Accounts"
        value={overview.users.total}
        icon={Users}
        description={`${formatCount(overview.users.enabled)} enabled · ${formatCount(overview.users.verified)} email verified`}
        note={`${formatCount(overview.users.newInRange)} registered in the reporting period`}
      />

      <MetricCard
        label="Active Memberships"
        value={overview.memberships.active}
        icon={UserCheck}
        description="Organization memberships with active status"
        note="A user can hold memberships in multiple organizations."
      />

      <MetricCard
        label="Paid Subscriptions"
        value={null}
        icon={CreditCard}
        description="Not configured"
        note="Available after Stripe subscription integration."
      />

      <MetricCard
        label="Monthly Recurring Revenue"
        value={null}
        icon={DollarSign}
        description="Not configured"
        note="Available after subscription plans and billing are connected."
      />

      <MetricCard
        label="Collected Payments"
        value={null}
        icon={DollarSign}
        description="Not configured"
        note="Available after Stripe payment events are recorded."
      />
    </div>
  );
}

//************************************************************** */

function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  note,
}: {
  label: string;
  value: number | null;
  icon: LucideIcon;
  description: string;
  note: string;
}) {
  const unavailable = value === null;

  return (
    <section className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-zinc-500">
          {label}
        </h2>

        <div
          className={[
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
            unavailable
              ? "bg-zinc-100 text-zinc-400"
              : "bg-orange-50 text-orange-500",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p
        aria-label={unavailable ? "Not available" : undefined}
        className={[
          "mt-4 text-3xl font-bold tracking-tight tabular-nums",
          unavailable ? "text-zinc-300" : "text-zinc-900",
        ].join(" ")}
      >
        {unavailable ? "—" : formatCount(value)}
      </p>

      <p className="mt-2 text-xs font-medium text-zinc-600">
        {description}
      </p>

      <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-400">
        {note}
      </p>
    </section>
  );
}

//************************************************************** */

function formatCount(value: number): string {
  return value.toLocaleString();
}

//************************************************************** */