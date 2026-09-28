'use client';

import { useEffect, useState } from 'react';

type CalendarEventForm = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  start_at: string;
  end_at: string;
  event_type: 'school' | 'holiday' | 'event' | 'meeting' | 'deadline';
  status: 'scheduled' | 'cancelled' | 'completed';
  all_day: boolean;
  color: string;
};

const emptyForm: CalendarEventForm = {
  title: '',
  slug: '',
  description: '',
  location: '',
  start_at: '',
  end_at: '',
  event_type: 'school',
  status: 'scheduled',
  all_day: false,
  color: '#FFD400',
};

export default function CalendarAdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState<CalendarEventForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    const response = await fetch('/api/admin/calendar');
    const result = await response.json();
    setEvents(result.data ?? []);
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleInputChange = (field: keyof CalendarEventForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      ...form,
      start_at: new Date(form.start_at).toISOString(),
      end_at: form.end_at ? new Date(form.end_at).toISOString() : new Date(form.start_at).toISOString(),
    };

    const url = form.id ? `/api/admin/calendar/${form.id}` : '/api/admin/calendar';
    const method = form.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || 'Unable to save event.');
      setLoading(false);
      return;
    }

    setMessage(form.id ? 'Event updated.' : 'Event created.');
    await fetchEvents();
    resetForm();
    setLoading(false);
  };

  const handleEdit = (eventItem: any) => {
    setForm({
      id: eventItem.id,
      title: eventItem.title || '',
      slug: eventItem.slug || '',
      description: eventItem.description || '',
      location: eventItem.location || '',
      start_at: eventItem.start_at ? new Date(eventItem.start_at).toISOString().slice(0, 16) : '',
      end_at: eventItem.end_at ? new Date(eventItem.end_at).toISOString().slice(0, 16) : '',
      event_type: eventItem.event_type || 'school',
      status: eventItem.status || 'scheduled',
      all_day: Boolean(eventItem.all_day),
      color: eventItem.color || '#FFD400',
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this calendar event?');
    if (!confirmed) return;

    const response = await fetch(`/api/admin/calendar/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      setMessage('Unable to delete event.');
      return;
    }

    setMessage('Calendar event deleted.');
    await fetchEvents();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Schedule</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Calendar management</h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">{form.id ? 'Edit event' : 'Create new event'}</h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Title</label>
                <input
                  value={form.title}
                  onChange={(event) => handleInputChange('title', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Slug</label>
                <input
                  value={form.slug}
                  onChange={(event) => handleInputChange('slug', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => handleInputChange('status', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Start</label>
                <input
                  type="datetime-local"
                  value={form.start_at}
                  onChange={(event) => handleInputChange('start_at', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">End</label>
                <input
                  type="datetime-local"
                  value={form.end_at}
                  onChange={(event) => handleInputChange('end_at', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Type</label>
                <select
                  value={form.event_type}
                  onChange={(event) => handleInputChange('event_type', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                >
                  <option value="school">School</option>
                  <option value="holiday">Holiday</option>
                  <option value="event">Event</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Color</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) => handleInputChange('color', event.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Location</label>
                <input
                  value={form.location}
                  onChange={(event) => handleInputChange('location', event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => handleInputChange('description', event.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.all_day}
                    onChange={(event) => handleInputChange('all_day', event.target.checked)}
                    className="h-4 w-4"
                  />
                  All day event
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
              >
                {loading ? 'Saving...' : form.id ? 'Update event' : 'Create event'}
              </button>

              {form.id ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Scheduled events</h3>
          <div className="mt-5 space-y-4">
            {events.length === 0 ? (
              <p className="text-slate-400">No events yet.</p>
            ) : (
              events.map((event) => (
                <article key={event.id} className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{event.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300">{event.event_type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {new Date(event.start_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">{event.location || 'No location provided'}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
