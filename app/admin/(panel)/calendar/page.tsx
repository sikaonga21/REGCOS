'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  MapPin,
  PencilSimple,
  Plus,
  Rows,
  SquaresFour,
  Trash,
} from 'phosphor-react';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorNotice,
  IconButton,
  PageHeader,
  Select,
  SkeletonRows,
  StatusBadge,
  useToast,
} from '@/components/admin/ui';
import { formatDateTime } from '@/lib/dates';
import { EVENT_TYPE_COLORS, type CalendarEvent, type EventType } from '@/lib/db/types';
import EventEditor from './EventEditor';

const EVENT_TYPES: EventType[] = ['school', 'holiday', 'event', 'meeting', 'deadline'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday-first grid of whole weeks covering the given month. */
function buildMonthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // 0 = Monday
  const start = new Date(first);
  start.setDate(first.getDate() - offset);

  const days: Date[] = [];
  for (let index = 0; index < 42; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    days.push(day);
  }

  // Trim a trailing all-next-month week so short months don't show six rows.
  return days.slice(0, days[35].getMonth() === month.getMonth() ? 42 : 35);
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function CalendarAdminPage() {
  const toast = useToast();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'month' | 'list'>('month');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [editing, setEditing] = useState<CalendarEvent | { start_at: string } | null>(null);
  const [deleting, setDeleting] = useState<CalendarEvent | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ pageSize: '100', sort: 'start_at', dir: 'asc' });
    if (typeFilter !== 'all') params.set('type', typeFilter);

    if (view === 'month') {
      // Fetch a generous window so the grid's leading/trailing days are populated.
      const from = new Date(month.getFullYear(), month.getMonth() - 1, 1);
      const to = new Date(month.getFullYear(), month.getMonth() + 2, 0);
      params.set('from', from.toISOString());
      params.set('to', to.toISOString());
    }

    try {
      const response = await fetch(`/api/admin/events?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) setError(result.error ?? 'Unable to load events.');
      else setEvents(result.data ?? []);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [month, typeFilter, view]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dayKey(new Date(event.start_at));
      const bucket = map.get(key);
      if (bucket) bucket.push(event);
      else map.set(key, [event]);
    }
    return map;
  }, [events]);

  const grid = useMemo(() => buildMonthGrid(month), [month]);
  const todayKey = dayKey(new Date());

  const upcoming = useMemo(
    () => events.filter((event) => new Date(event.start_at) >= new Date()).slice(0, 60),
    [events]
  );

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/events/${deleting.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not delete the event.', 'error');
      } else {
        toast.push('Event deleted.');
        setDeleting(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const shiftMonth = (delta: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Term dates, holidays, meetings, and school events shown on the public calendar."
        actions={
          <Button onClick={() => setEditing({ start_at: '' })}>
            <Plus size={16} />
            New event
          </Button>
        }
      />

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
          {view === 'month' ? (
            <div className="flex items-center gap-1.5">
              <IconButton label="Previous month" variant="outline" onClick={() => shiftMonth(-1)}>
                <CaretLeft size={15} />
              </IconButton>
              <p className="min-w-40 text-center font-heading text-sm font-semibold text-primary-dark">
                {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
              <IconButton label="Next month" variant="outline" onClick={() => shiftMonth(1)}>
                <CaretRight size={15} />
              </IconButton>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                }}
              >
                Today
              </Button>
            </div>
          ) : (
            <p className="font-heading text-sm font-semibold text-primary-dark">Upcoming events</p>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-auto"
              aria-label="Filter by event type"
            >
              <option value="all">All types</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setView('month')}
                aria-pressed={view === 'month'}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                  view === 'month' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
                }`}
              >
                <SquaresFour size={13} />
                Month
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                  view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
                }`}
              >
                <Rows size={13} />
                List
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

          {loading ? (
            <SkeletonRows rows={6} />
          ) : view === 'month' ? (
            <div className="overflow-x-auto">
              <div className="min-w-[44rem]">
                <div className="grid grid-cols-7 gap-px rounded-t-xl bg-slate-200">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="bg-bg-light py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-xl bg-slate-200">
                  {grid.map((day) => {
                    const key = dayKey(day);
                    const dayEvents = byDay.get(key) ?? [];
                    const inMonth = day.getMonth() === month.getMonth();
                    const isToday = key === todayKey;

                    return (
                      <div
                        key={key}
                        className={`min-h-24 p-1.5 ${inMonth ? 'bg-white' : 'bg-slate-50/80'}`}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                              isToday
                                ? 'bg-primary text-white'
                                : inMonth
                                  ? 'text-slate-600'
                                  : 'text-slate-400'
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          <button
                            type="button"
                            aria-label={`Add an event on ${day.toLocaleDateString('en-GB', { dateStyle: 'long' })}`}
                            onClick={() => {
                              const at = new Date(day);
                              at.setHours(9, 0, 0, 0);
                              setEditing({ start_at: at.toISOString() });
                            }}
                            className="rounded p-0.5 text-slate-300 transition hover:bg-primary/8 hover:text-primary"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <ul className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <li key={event.id}>
                              <button
                                type="button"
                                onClick={() => setEditing(event)}
                                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] transition hover:bg-slate-100"
                              >
                                <span
                                  aria-hidden="true"
                                  className="h-2 w-2 shrink-0 rounded-sm"
                                  style={{
                                    backgroundColor: event.color || EVENT_TYPE_COLORS[event.event_type],
                                  }}
                                />
                                <span
                                  className={`min-w-0 flex-1 truncate font-medium ${
                                    event.status === 'cancelled'
                                      ? 'text-slate-400 line-through'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {event.title}
                                </span>
                              </button>
                            </li>
                          ))}
                          {dayEvents.length > 3 ? (
                            <li className="px-1.5 text-[10px] font-medium text-slate-400">
                              +{dayEvents.length - 3} more
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarBlank size={22} />}
              title="No upcoming events"
              description="Add term dates, holidays, and school events so parents can plan ahead."
              action={
                <Button onClick={() => setEditing({ start_at: '' })}>
                  <Plus size={16} />
                  New event
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((event) => (
                <li key={event.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.event_type] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-slate-800">{event.title}</span>
                      <Badge tone="blue">{event.event_type}</Badge>
                      {event.status !== 'scheduled' ? <StatusBadge status={event.status} /> : null}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {event.all_day
                          ? new Date(event.start_at).toLocaleDateString('en-GB', { dateStyle: 'long' })
                          : formatDateTime(event.start_at)}
                      </span>
                      {event.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {event.location}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <IconButton label="Edit event" onClick={() => setEditing(event)}>
                      <PencilSimple size={15} />
                    </IconButton>
                    <IconButton
                      label="Delete event"
                      onClick={() => setDeleting(event)}
                      className="text-accent hover:bg-accent/10"
                    >
                      <Trash size={15} />
                    </IconButton>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {editing ? (
        <EventEditor
          event={'id' in editing ? editing : null}
          defaultStart={'id' in editing ? '' : editing.start_at}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this event?"
        message={`“${deleting?.title ?? ''}” will be removed from the public calendar. This cannot be undone.`}
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
