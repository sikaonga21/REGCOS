'use client';

import { useState } from 'react';
import {
  Button,
  Checkbox,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from '@/components/admin/ui';
import { toDateTimeLocal } from '@/lib/dates';
import { slugify } from '@/lib/slug';
import { EVENT_TYPE_COLORS, type CalendarEvent, type EventType } from '@/lib/db/types';

const EVENT_TYPES: Array<{ value: EventType; label: string; help: string }> = [
  { value: 'school', label: 'School', help: 'Term dates and school-wide days' },
  { value: 'holiday', label: 'Holiday', help: 'Closures and public holidays' },
  { value: 'event', label: 'Event', help: 'Sports day, concerts, open days' },
  { value: 'meeting', label: 'Meeting', help: 'Parent-teacher and staff meetings' },
  { value: 'deadline', label: 'Deadline', help: 'Fee and application cut-offs' },
];

type FormState = {
  title: string;
  slug: string;
  description: string;
  location: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  event_type: EventType;
  status: 'scheduled' | 'cancelled' | 'completed';
  color: string;
};

export default function EventEditor({
  event,
  defaultStart,
  onClose,
  onSaved,
}: {
  event: CalendarEvent | null;
  defaultStart?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();

  const [form, setForm] = useState<FormState>(() => {
    if (event) {
      return {
        title: event.title,
        slug: event.slug,
        description: event.description ?? '',
        location: event.location ?? '',
        start_at: toDateTimeLocal(event.start_at),
        end_at: toDateTimeLocal(event.end_at),
        all_day: Boolean(event.all_day),
        event_type: event.event_type,
        status: event.status,
        color: event.color || EVENT_TYPE_COLORS[event.event_type],
      };
    }

    const start = toDateTimeLocal(defaultStart || new Date().toISOString());
    return {
      title: '',
      slug: '',
      description: '',
      location: '',
      start_at: start,
      end_at: start,
      all_day: false,
      event_type: 'school',
      status: 'scheduled',
      color: EVENT_TYPE_COLORS.school,
    };
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [slugLocked, setSlugLocked] = useState(Boolean(event));
  // Whether the colour has been chosen by hand; if not, it tracks the event type.
  const [colorLocked, setColorLocked] = useState(
    Boolean(event && event.color && event.color !== EVENT_TYPE_COLORS[event.event_type])
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === 'title' && !slugLocked) next.slug = slugify(String(value));
      if (key === 'event_type' && !colorLocked) next.color = EVENT_TYPE_COLORS[value as EventType];
      // Keep the end at or after the start as the user types.
      if (key === 'start_at' && (!current.end_at || current.end_at < String(value))) {
        next.end_at = String(value);
      }

      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSave = async () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) nextErrors.title = 'A title is required.';
    if (!form.start_at) nextErrors.start_at = 'A start date and time is required.';
    if (form.end_at && form.start_at && form.end_at < form.start_at) {
      nextErrors.end_at = 'The end cannot be before the start.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(event ? `/api/admin/events/${event.id}` : '/api/admin/events', {
        method: event ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: form.slug || slugify(form.title) }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not save the event.', 'error');
        setSaving(false);
        return;
      }

      toast.push(event ? 'Event updated.' : 'Event added to the calendar.');
      onSaved();
    } catch {
      toast.push('Could not reach the server.', 'error');
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? 'Edit event' : 'New event'}
      description="Events appear on the public calendar page as soon as they are saved."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} loading={saving}>
            {event ? 'Save changes' : 'Add event'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" required error={errors.title}>
          <Input
            value={form.title}
            onChange={(event_) => update('title', event_.target.value)}
            placeholder="Parent-teacher meeting"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event type">
            <Select
              value={form.event_type}
              onChange={(event_) => update('event_type', event_.target.value as EventType)}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} — {type.help}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status">
            <Select
              value={form.status}
              onChange={(event_) => update('status', event_.target.value as FormState['status'])}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>

          <Field label="Starts" required error={errors.start_at}>
            <Input
              type="datetime-local"
              value={form.start_at}
              onChange={(event_) => update('start_at', event_.target.value)}
            />
          </Field>

          <Field label="Ends" error={errors.end_at} hint="Leave matching the start for a single moment.">
            <Input
              type="datetime-local"
              value={form.end_at}
              min={form.start_at || undefined}
              onChange={(event_) => update('end_at', event_.target.value)}
            />
          </Field>
        </div>

        <Checkbox
          label="All-day event"
          description="Hides the time on the public calendar."
          checked={form.all_day}
          onChange={(event_) => update('all_day', event_.target.checked)}
        />

        <Field label="Location">
          <Input
            value={form.location}
            onChange={(event_) => update('location', event_.target.value)}
            placeholder="School hall"
          />
        </Field>

        <Field label="Description" hint="Shown under the event on the public calendar.">
          <Textarea
            rows={4}
            value={form.description}
            onChange={(event_) => update('description', event_.target.value)}
            placeholder="A collaborative forum to discuss each child's progress."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="URL slug" hint={slugLocked ? undefined : 'Generated from the title.'}>
            <Input
              value={form.slug}
              onChange={(event_) => {
                setSlugLocked(true);
                update('slug', slugify(event_.target.value));
              }}
              placeholder="parent-teacher-meeting"
            />
          </Field>

          <Field label="Colour" hint="Used for the dot on the calendar.">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(event_) => {
                  setColorLocked(true);
                  update('color', event_.target.value);
                }}
                aria-label="Event colour"
                className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
              />
              <Input
                value={form.color}
                onChange={(event_) => {
                  setColorLocked(true);
                  update('color', event_.target.value);
                }}
                aria-label="Event colour hex value"
              />
              {colorLocked ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setColorLocked(false);
                    update('color', EVENT_TYPE_COLORS[form.event_type]);
                  }}
                >
                  Reset
                </Button>
              ) : null}
            </div>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
