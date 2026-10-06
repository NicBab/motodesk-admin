"use client";

import { useId, useState } from "react";

import type {
  PlatformGrowth,
  PlatformGrowthPoint,
} from "../dashboard.types";

//************************************************************** */

type ChartMode = "daily" | "cumulative";

const WIDTH = 900;
const HEIGHT = 300;

const PADDING = {
  top: 20,
  right: 24,
  bottom: 42,
  left: 64,
};

const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

//************************************************************** */

function pointValues(
  point: PlatformGrowthPoint,
  mode: ChartMode,
) {
  return {
    organizations:
      mode === "daily"
        ? point.newOrganizations
        : point.cumulativeOrganizations,

    users:
      mode === "daily"
        ? point.newUsers
        : point.cumulativeUsers,
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

//************************************************************** */

export function DashboardGrowthChart({
  growth,
}: {
  growth: PlatformGrowth;
}) {
  const [mode, setMode] = useState<ChartMode>("daily");
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const titleId = useId();
  const descriptionId = useId();

  const { points } = growth;

  const values = points.map((point) => pointValues(point, mode));

  const highestValue = Math.max(
    1,
    ...values.map((value) =>
      Math.max(value.organizations, value.users),
    ),
  );

  // An integer axis avoids fractional account counts.
  const tickStep = Math.max(1, Math.ceil(highestValue / 4));
  const axisMaximum = tickStep * 4;

  const x = (index: number) =>
    points.length <= 1
      ? PADDING.left + PLOT_WIDTH / 2
      : PADDING.left + (index / (points.length - 1)) * PLOT_WIDTH;

  const y = (value: number) =>
    PADDING.top + PLOT_HEIGHT - (value / axisMaximum) * PLOT_HEIGHT;

  const organizationLine = values
    .map((value, index) => `${x(index)},${y(value.organizations)}`)
    .join(" ");

  const userLine = values
    .map((value, index) => `${x(index)},${y(value.users)}`)
    .join(" ");

  const labelIndices = [...new Set([
    0,
    Math.floor((points.length - 1) / 2),
    points.length - 1,
  ])].filter((index) => index >= 0);

  const detailIndex =
    selectedIndex !== null && points[selectedIndex]
      ? selectedIndex
      : points.length - 1;

  const detailPoint = points[detailIndex];
  const detailValues = detailPoint
    ? pointValues(detailPoint, mode)
    : null;

  //************************************************************** */

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 p-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Account Growth
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {mode === "daily"
              ? "New organization and user registrations per UTC day."
              : "Cumulative registrations through each UTC day."}
          </p>
        </div>

        <div
          role="group"
          aria-label="Growth chart mode"
          className="flex rounded-lg bg-zinc-100 p-1"
        >
          {(["daily", "cumulative"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                mode === option
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900",
              ].join(" ")}
            >
              {option === "daily" ? "Daily" : "Cumulative"}
            </button>
          ))}
        </div>
      </header>

      <div className="p-5">
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            Organizations
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Users
          </span>
        </div>

        {points.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            No chart dates are available for this period.
          </p>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-labelledby={`${titleId} ${descriptionId}`}
              className="block w-full"
            >
              <title id={titleId}>
                {mode === "daily" ? "Daily" : "Cumulative"} account registrations
              </title>

              <desc id={descriptionId}>
                Orange shows organizations and blue shows user accounts.
                Exact daily values are available below the chart.
              </desc>

              {[0, 1, 2, 3, 4].map((index) => {
                const value = index * tickStep;
                const position = y(value);

                return (
                  <g key={index}>
                    <line
                      x1={PADDING.left}
                      x2={WIDTH - PADDING.right}
                      y1={position}
                      y2={position}
                      stroke="#e4e4e7"
                      strokeDasharray="4 4"
                    />

                    <text
                      x={PADDING.left - 10}
                      y={position + 4}
                      textAnchor="end"
                      fill="#71717a"
                      fontSize="11"
                    >
                      {value.toLocaleString("en-US")}
                    </text>
                  </g>
                );
              })}

              <polyline
                points={organizationLine}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              <polyline
                points={userLine}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {points.length === 1 ? (
                <>
                  <circle
                    cx={x(0)}
                    cy={y(values[0].organizations)}
                    r="4"
                    fill="#f97316"
                  />

                  <circle
                    cx={x(0)}
                    cy={y(values[0].users)}
                    r="4"
                    fill="#3b82f6"
                  />
                </>
              ) : null}

              {detailValues ? (
                <g>
                  <line
                    x1={x(detailIndex)}
                    x2={x(detailIndex)}
                    y1={PADDING.top}
                    y2={HEIGHT - PADDING.bottom}
                    stroke="#a1a1aa"
                    strokeDasharray="3 3"
                  />

                  <circle
                    cx={x(detailIndex)}
                    cy={y(detailValues.organizations)}
                    r="4"
                    fill="#f97316"
                  />

                  <circle
                    cx={x(detailIndex)}
                    cy={y(detailValues.users)}
                    r="4"
                    fill="#3b82f6"
                  />
                </g>
              ) : null}

              {labelIndices.map((index) => (
                <text
                  key={index}
                  x={x(index)}
                  y={HEIGHT - 14}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="11"
                >
                  {formatDate(points[index].date)}
                </text>
              ))}
            </svg>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-zinc-50 p-3">
              <label className="flex items-center gap-2 text-xs text-zinc-600">
                Inspect date

                <select
                  value={detailIndex}
                  onChange={(event) =>
                    setSelectedIndex(Number(event.target.value))
                  }
                  className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-700"
                >
                  {points.map((point, index) => (
                    <option key={point.date} value={index}>
                      {point.date}
                    </option>
                  ))}
                </select>
              </label>

              {detailValues ? (
                <p className="text-xs tabular-nums text-zinc-600">
                  <span className="font-semibold text-orange-600">
                    {detailValues.organizations.toLocaleString()}
                  </span>{" "}
                  organizations
                  <span className="mx-3 text-zinc-300">·</span>
                  <span className="font-semibold text-blue-600">
                    {detailValues.users.toLocaleString()}
                  </span>{" "}
                  users
                </p>
              ) : null}
            </div>
          </>
        )}

        <p className="mt-4 text-xs leading-5 text-zinc-400">
          {growth.description}
        </p>
      </div>
    </section>
  );
}

//************************************************************** */