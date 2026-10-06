"use client";

import { useState, type FormEvent } from "react";

import { CalendarDays, RefreshCw } from "lucide-react";

import type {
  PlatformDateRangeInput,
} from "../dashboard.types";

//************************************************************** */

const DAY_MS = 24 * 60 * 60 * 1000;

const inputClasses =
  "h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

//************************************************************** */

export function createDashboardRange(
  days = 30,
): PlatformDateRangeInput {
  const before = shiftDate(utcToday(), 1);

  return {
    from: shiftDate(before, -days),
    before,
  };
}

//************************************************************** */

export function DashboardDateRange({
  range,
  isFetching,
  onChange,
  onRefresh,
}: {
  range: PlatformDateRangeInput;
  isFetching: boolean;
  onChange: (range: PlatformDateRangeInput) => void;
  onRefresh: () => void;
}) {
  const [from, setFrom] = useState(range.from);
  const [through, setThrough] = useState(
    shiftDate(range.before, -1),
  );

  const [error, setError] = useState<string | null>(null);

  //************************************************************** */

  function applyPreset(days: number) {
    const nextRange = createDashboardRange(days);

    setFrom(nextRange.from);
    setThrough(shiftDate(nextRange.before, -1));
    setError(null);
    onChange(nextRange);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValidDate(from) || !isValidDate(through)) {
      setError("Enter valid start and end dates.");
      return;
    }

    if (from > through) {
      setError("The through date must be on or after the start date.");
      return;
    }

    if (through > utcToday()) {
      setError("The date range cannot include future UTC days.");
      return;
    }

    const before = shiftDate(through, 1);

    const days =
      (
        Date.parse(`${before}T00:00:00.000Z`) -
        Date.parse(`${from}T00:00:00.000Z`)
      ) / DAY_MS;

    if (days > 366) {
      setError("Select a range of 366 days or fewer.");
      return;
    }

    onChange({ from, before });
  }

  //************************************************************** */

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="mr-auto">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
              <CalendarDays className="h-4 w-4 text-zinc-400" />
              Reporting Period
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Registration metrics use UTC calendar days.
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {[7, 30, 90, 365].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => applyPreset(days)}
                className="h-9 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                {days === 365 ? "1 year" : `${days} days`}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">
              From
            </span>

            <input
              type="date"
              required
              value={from}
              max={through || utcToday()}
              onChange={(event) => {
                setFrom(event.target.value);
                setError(null);
              }}
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">
              Through
            </span>

            <input
              type="date"
              required
              value={through}
              min={from || undefined}
              max={utcToday()}
              onChange={(event) => {
                setThrough(event.target.value);
                setError(null);
              }}
              className={inputClasses}
            />
          </label>

          <button
            type="submit"
            className="h-9 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Apply
          </button>

          <button
            type="button"
            aria-label="Refresh dashboard"
            disabled={isFetching}
            onClick={onRefresh}
            className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            <RefreshCw
              className={[
                "h-4 w-4",
                isFetching ? "animate-spin" : "",
              ].join(" ")}
            />
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Applied: {range.from} through {shiftDate(range.before, -1)} UTC
        </p>

        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}

//************************************************************** */