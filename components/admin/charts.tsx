'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Rows, TrendUp } from 'phosphor-react';
import {
  CHART_CHROME,
  PIPELINE_RAMP,
  PIPELINE_STAGES,
  SERIES_COLORS,
  SERIES_LABELS,
  compactNumber,
  monthLabel,
} from '@/lib/chart-palette';

type TrendPoint = { month: string; enrollments: number; messages: number; posts: number };
type SeriesKey = 'enrollments' | 'messages' | 'posts';

const SERIES: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: 'enrollments', label: SERIES_LABELS.enrollments, color: SERIES_COLORS[0] },
  { key: 'messages', label: SERIES_LABELS.messages, color: SERIES_COLORS[1] },
  { key: 'posts', label: SERIES_LABELS.posts, color: SERIES_COLORS[2] },
];

/* -------------------------------------------------------------------------- */
/* Shared tooltip                                                             */
/* -------------------------------------------------------------------------- */

type TooltipPayload = { name?: string; value?: number | string; color?: string; dataKey?: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/97 px-3 py-2 shadow-lg backdrop-blur">
      {label ? (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-xs">
            {/* The swatch carries identity; the text stays in ink tokens. */}
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="min-w-0 flex-1 text-slate-600">{entry.name}</span>
            <span className="font-semibold tabular-nums text-slate-800">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Six-month trend                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Three series on one axis — counts of the same kind of thing (submissions per
 * month), so they share a scale. Never a second y-axis.
 *
 * The table toggle is the relief channel for readers who cannot separate the
 * marks by hue, and doubles as the accessible view of the same numbers.
 */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const rows = useMemo(
    () => data.map((point) => ({ ...point, label: monthLabel(point.month) })),
    [data]
  );

  const isEmpty = rows.every((row) => row.enrollments + row.messages + row.posts === 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {SERIES.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setView('chart')}
            aria-pressed={view === 'chart'}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              view === 'chart' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <TrendUp size={13} />
            Chart
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            aria-pressed={view === 'table'}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              view === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <Rows size={13} />
            Table
          </button>
        </div>
      </div>

      {isEmpty ? (
        <p className="flex h-64 items-center justify-center text-sm text-slate-400">
          No activity recorded in the last six months yet.
        </p>
      ) : view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Enrollments, messages, and posts per month for the last six months
            </caption>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Month
                </th>
                {SERIES.map((series) => (
                  <th key={series.key} scope="col" className="py-2 pr-4 text-right font-semibold">
                    {series.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="py-2 pr-4 text-left font-medium text-slate-700">
                    {row.label}
                  </th>
                  {SERIES.map((series) => (
                    <td
                      key={series.key}
                      className="py-2 pr-4 text-right tabular-nums text-slate-600"
                    >
                      {row[series.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <defs>
                {SERIES.map((series) => (
                  <linearGradient
                    key={series.key}
                    id={`trend-${series.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={series.color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={series.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>

              {/* Hairline, solid, horizontal only — recessive chrome. */}
              <CartesianGrid vertical={false} stroke={CHART_CHROME.grid} strokeWidth={1} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: CHART_CHROME.axisLabel, fontSize: 11 }}
                dy={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={44}
                tick={{ fill: CHART_CHROME.axisLabel, fontSize: 11 }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: CHART_CHROME.axis, strokeWidth: 1 }}
              />

              {SERIES.map((series) => (
                <Area
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={series.color}
                  strokeWidth={2}
                  fill={`url(#trend-${series.key})`}
                  // 2px surface ring keeps overlapping markers separable.
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Admissions pipeline                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Horizontal bars, one per pipeline stage, on the ordinal brand-blue ramp —
 * colour tracks the stage, so filtering or a zero stage never repaints the rest.
 * Values are labelled directly, so there is no legend to cross-reference.
 */
export function PipelineChart({ counts }: { counts: Array<{ status: string; count: number }> }) {
  const lookup = useMemo(
    () => Object.fromEntries(counts.map((row) => [row.status, row.count])),
    [counts]
  );

  const rows = PIPELINE_STAGES.map((stage, index) => ({
    label: stage.label,
    count: lookup[stage.key] ?? 0,
    color: PIPELINE_RAMP[index],
  }));

  const total = rows.reduce((sum, row) => sum + row.count, 0);

  if (total === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-sm text-slate-400">
        No applications have arrived yet.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 36, bottom: 0, left: 4 }}
          barCategoryGap={8}
        >
          <CartesianGrid horizontal={false} stroke={CHART_CHROME.grid} strokeWidth={1} />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={78}
            tick={{ fill: CHART_CHROME.axisLabel, fontSize: 11 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(6,59,130,0.04)' }} />
          <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {rows.map((row) => (
              <Cell key={row.label} fill={row.color} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              offset={8}
              className="fill-slate-600"
              style={{ fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sparkline for stat tiles                                                   */
/* -------------------------------------------------------------------------- */

/** Twelve-point-or-fewer trend in the de-emphasis hue; the final point is accented. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2 || values.every((value) => value === 0)) return null;

  const width = 72;
  const height = 24;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);

  const points = values.map((value, index) => ({
    x: index * step,
    y: height - (value / max) * (height - 4) - 2,
  }));

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${label} trend over the last ${values.length} months`}
      className="shrink-0 overflow-visible"
    >
      <path d={path} fill="none" stroke={CHART_CHROME.sparklineMuted} strokeWidth={2} strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={CHART_CHROME.sparklineAccent} />
    </svg>
  );
}

export { compactNumber };
