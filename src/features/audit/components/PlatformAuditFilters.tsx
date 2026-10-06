"use client";

import type { FormEvent } from "react";

import { Search, SlidersHorizontal } from "lucide-react";

import type { PlatformAuditScope } from "../audit.types";

//************************************************************** */

export type PlatformAuditFilterValues = {
  search: string;
  scope: PlatformAuditScope;
  organizationId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  startDate: string;
  endDate: string;
};

export const EMPTY_PLATFORM_AUDIT_FILTERS:
  PlatformAuditFilterValues = {
    search: "",
    scope: "ALL",
    organizationId: "",
    actorUserId: "",
    action: "",
    resourceType: "",
    resourceId: "",
    startDate: "",
    endDate: "",
  };

//************************************************************** */

const inputClasses =
  "h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-50 disabled:text-zinc-400";

//************************************************************** */

export function PlatformAuditFilters({
  values,
  error,
  onChange,
  onApply,
  onReset,
}: {
  values: PlatformAuditFilterValues;
  error: string | null;
  onChange: (values: PlatformAuditFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  function update(
    field: keyof PlatformAuditFilterValues,
    value: string,
  ) {
    onChange({
      ...values,
      [field]: value,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
        Filter Audit Events
      </h2>

      <label className="block">
        <span className="mb-2 block text-xs font-medium text-zinc-600">
          Search
        </span>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />

          <input
            type="search"
            maxLength={200}
            value={values.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Actor, organization, action, resource, event ID, or IP"
            className={`${inputClasses} pl-9`}
          />
        </div>
      </label>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-600">
            Event Scope
          </span>

          <select
            value={values.scope}
            onChange={(event) => {
              const scope = event.target.value as PlatformAuditScope;

              onChange({
                ...values,
                scope,
                organizationId:
                  scope === "UNASSIGNED"
                    ? ""
                    : values.organizationId,
              });
            }}
            className={inputClasses}
          >
            <option value="ALL">All events</option>
            <option value="ORGANIZATION">Organization-linked events</option>
            <option value="UNASSIGNED">Unassigned events</option>
          </select>
        </label>

        <TextFilter
          label="Organization ID"
          value={values.organizationId}
          disabled={values.scope === "UNASSIGNED"}
          placeholder="Exact organization ID"
          onChange={(value) => update("organizationId", value)}
        />

        <TextFilter
          label="Actor User ID"
          value={values.actorUserId}
          placeholder="Exact user ID"
          onChange={(value) => update("actorUserId", value)}
        />

        <TextFilter
          label="Action / Event"
          value={values.action}
          placeholder="e.g. auth.login.succeeded"
          onChange={(value) => update("action", value)}
        />

        <TextFilter
          label="Resource Type"
          value={values.resourceType}
          placeholder="e.g. User or PlatformAdmin"
          onChange={(value) => update("resourceType", value)}
        />

        <TextFilter
          label="Resource ID"
          value={values.resourceId}
          placeholder="Exact resource ID"
          onChange={(value) => update("resourceId", value)}
        />

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-600">
            From Date (UTC)
          </span>

          <input
            type="date"
            value={values.startDate}
            max={values.endDate || undefined}
            onChange={(event) => update("startDate", event.target.value)}
            className={inputClasses}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-600">
            Through Date (UTC)
          </span>

          <input
            type="date"
            value={values.endDate}
            min={values.startDate || undefined}
            onChange={(event) => update("endDate", event.target.value)}
            className={inputClasses}
          />
        </label>
      </div>

      <p className="text-xs leading-5 text-zinc-500">
        Search matches display fields and excludes metadata. Other text
        filters require exact values. Dates include the entire selected UTC day.
        Unassigned events have no organization association.
      </p>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 border-t border-zinc-100 pt-4">
        <button
          type="submit"
          className="h-9 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={onReset}
          className="h-9 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

//************************************************************** */

function TextFilter({
  label,
  value,
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-zinc-600">
        {label}
      </span>

      <input
        type="text"
        maxLength={200}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClasses}
      />
    </label>
  );
}

//************************************************************** */