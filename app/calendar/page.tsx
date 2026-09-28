'use client';

import { useEffect, useState } from 'react';
import { CalendarBlank, MapPin, Clock } from 'phosphor-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { supabase } from '@/lib/supabase';

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_at?: string;
  end_at?: string;
  event_type?: string;
  status?: string;
  color?: string;
};

const fallbackEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'School Term Begins',
    description: 'Welcome back to a new term filled with learning, faith, and growth.',
    location: 'Regcos Christian Academy',
    start_at: '2026-09-28T08:30:00.000Z',
    end_at: '2026-09-28T10:30:00.000Z',
    event_type: 'school',
    status: 'scheduled',
    color: '#FFD400',
  },
  {
    id: '2',
    title: 'Parent-Teacher Meeting',
    description: 'A collaborative forum to discuss student progress and partnership.',
    location: 'School Hall',
    start_at: '2026-10-05T10:00:00.000Z',
    end_at: '2026-10-05T12:00:00.000Z',
    event_type: 'meeting',
    status: 'scheduled',
    color: '#38bdf8',
  },
  {
    id: '3',
    title: 'Sports Day',
    description: 'A joyful day of healthy competition, teamwork, and school spirit.',
    location: 'Main Field',
    start_at: '2026-10-15T09:00:00.000Z',
    end_at: '2026-10-15T15:00:00.000Z',
    event_type: 'event',
    status: 'scheduled',
    color: '#22c55e',
  },
];

const formatDate = (value?: string) => {
  if (!value) return 'Date to be announced';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(fallbackEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('start_at', { ascending: true });

        if (!error && data && data.length > 0) {
          setEvents(data as CalendarEvent[]);
        } else {
          setEvents(fallbackEvents);
        }
      } catch {
        setEvents(fallbackEvents);
      } finally {
        setLoading(false);
      }
    };

    void fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-800">
      <Header />

      <main className="pt-32 pb-20">
        <section className="container mx-auto px-4">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#063B82]/60">School timeline</p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-[#063B82] md:text-6xl">Calendar</h1>
            <div className="mt-4 h-1 w-20 bg-[#FFD400]" />
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 h-4 w-24 rounded bg-slate-200" />
                  <div className="mb-3 h-7 w-2/3 rounded bg-slate-200" />
                  <div className="mb-2 h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900"
                      style={{ backgroundColor: event.color || '#FFD400' }}
                    >
                      {event.event_type || 'event'}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{event.status || 'scheduled'}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#063B82]">{event.title}</h2>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {event.description || 'A scheduled school event for our community.'}
                  </p>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <CalendarBlank size={18} className="text-[#063B82]" />
                      <span>{formatDate(event.start_at)}</span>
                    </div>
                    {event.end_at ? (
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-[#063B82]" />
                        <span>{formatDate(event.end_at)}</span>
                      </div>
                    ) : null}
                    {event.location ? (
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-[#063B82]" />
                        <span>{event.location}</span>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
