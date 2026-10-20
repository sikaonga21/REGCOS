/**
 * Chart colours for the admin dashboard.
 *
 * These are the Regcos brand hues re-stepped onto chart-safe OKLCH lightness,
 * not the raw brand hex values: #063B82 sits at L 0.367 (below the 0.43–0.77
 * light-mode band) and #FFD400 at L 0.881 with only 1.43:1 contrast on white,
 * so both would fail as data colours. Each slot keeps its brand hue angle and
 * moves only lightness.
 *
 * Validated against a #FFFFFF card surface with the all-pairs check:
 *   lightness band    PASS
 *   chroma floor      PASS (all >= 0.10)
 *   CVD separation    PASS (worst pair ΔE 8.2 deutan, 18.0 tritan)
 *   normal vision     PASS (worst pair ΔE 22.6)
 *   contrast          PASS (all >= 3:1)
 *
 * Slots are assigned in fixed order and never cycled — a series keeps its colour
 * when the chart is filtered.
 */
export const SERIES_COLORS = ['#004FB0', '#AA8D00', '#D71920'] as const;

/**
 * Ordinal ramp for the admissions pipeline. Application status is a sequence
 * (new → reviewing → outcome), so it takes one hue with monotone lightness
 * rather than categorical hues. Validated with the ordinal checks: monotone L,
 * adjacent ΔL >= 0.06, light end 2.07:1 on white, single hue.
 */
export const PIPELINE_RAMP = ['#004FB0', '#0064DC', '#1B7CFF', '#579AFF', '#85B6FF'] as const;

/** Recessive chrome: hairline grid and axis ink that never competes with the marks. */
export const CHART_CHROME = {
  grid: '#E6EAF1',
  axis: '#94A3B8',
  axisLabel: '#64748B',
  sparklineMuted: '#C7D7F0',
  sparklineAccent: '#004FB0',
} as const;

export const SERIES_LABELS = {
  enrollments: 'Enrollments',
  messages: 'Messages',
  posts: 'Posts',
} as const;

/** Pipeline order. Index into PIPELINE_RAMP, so colour tracks stage, not count. */
export const PIPELINE_STAGES = [
  { key: 'new', label: 'New' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'waitlist', label: 'Waitlist' },
  { key: 'declined', label: 'Declined' },
] as const;

/** Compact display for stat-tile values: 1,284 / 12.9K. */
export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 10_000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('en-GB');
}

/** `2026-03` → `Mar`, for the month axis. */
export function monthLabel(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  if (!year || !monthIndex) return month;
  return new Date(year, monthIndex - 1, 1).toLocaleDateString('en-GB', { month: 'short' });
}
