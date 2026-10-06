import {
  CreditCard,
  DollarSign,
  Receipt,
} from "lucide-react";

import {
  AdminShell,
} from "@/components/layout/AdminShell";

//************************************************************** */

export default function AdminBillingPage() {
  return (
    <AdminShell
      activeSection="billing"
      title="Billing"
      description="Platform subscriptions, recurring revenue, and payment activity."
    >
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500">
            <CreditCard className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Billing Integration Pending
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              Stripe has not been connected. Subscription status, revenue,
              invoices, and payment events will appear here after billing
              integration is implemented and verified.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <BillingMetric
          title="Subscriptions"
          description="Active, trialing, past-due, and canceled subscriptions."
          icon="subscriptions"
        />

        <BillingMetric
          title="Recurring Revenue"
          description="Monthly recurring revenue derived from subscription pricing."
          icon="revenue"
        />

        <BillingMetric
          title="Payment Activity"
          description="Collected payments, failed payments, refunds, and invoices."
          icon="payments"
        />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Billing Exemptions
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          Explicit platform-account billing exemptions have been added to
          the backend. Subscription enforcement and the organization-level
          treatment of those exemptions will be implemented during the
          Stripe phase.
        </p>

        <p className="mt-3 text-xs leading-5 text-zinc-400">
          Platform administrator access and billing exemption are separate
          settings. An administrator role alone does not grant an exemption.
        </p>
      </section>
    </AdminShell>
  );
}

//************************************************************** */

function BillingMetric({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "subscriptions" | "revenue" | "payments";
}) {
  const Icon =
    icon === "subscriptions"
      ? CreditCard
      : icon === "revenue"
        ? DollarSign
        : Receipt;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-zinc-500">
          {title}
        </h2>

        <Icon className="h-5 w-5 text-zinc-300" />
      </div>

      <p
        aria-label="Not available"
        className="mt-4 text-3xl font-bold text-zinc-300"
      >
        —
      </p>

      <p className="mt-2 text-xs font-semibold text-zinc-500">
        Not configured
      </p>

      <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-400">
        {description}
      </p>
    </section>
  );
}

//************************************************************** */