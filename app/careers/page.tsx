'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import InnerPageHero from '@/components/InnerPageHero';
import { supabase, type CareerItem } from '@/lib/supabase';

export default function CareersPage() {
  const [loading, setLoading] = useState(true);
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('careers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message ?? 'Failed to load careers');
        setLoading(false);
        return;
      }

      setCareers((data ?? []) as CareerItem[]);
      setLoading(false);
    };

    fetchCareers();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <InnerPageHero
          eyebrow="Join Our Team"
          title="Careers at Regcos Christian Academy"
          description="Explore current openings and discover where your experience can support a Christ-centered school community, student growth, and educational excellence across Zambia."
          backgroundImage="/images/team-hero.jpg"
        />

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                viewport={{ once: true, margin: '-80px' }}
              >
                <p className="text-[#0a192f]/50 font-bold text-xs uppercase tracking-[0.3em] mb-4">
                  Open Roles
                </p>
                <h2 className="text-4xl font-bold text-[#0a192f] uppercase mb-4">Current Openings</h2>
                <div className="w-12 h-0.5 bg-[#f7b733] mb-4" />
                <p className="text-gray-600 max-w-3xl">
                  All positions are based in Zambia. Roles are subject to change as we grow.
                </p>
              </motion.div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 p-6 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
            ) : careers.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 p-12 text-center text-gray-500">
                No open positions at the moment.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {careers.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: idx * 0.05 }}
                    viewport={{ once: true, margin: '-80px' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-2 h-8 bg-[#f7b733] rounded-full" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {job.department} · {job.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0a192f] mb-3">{job.title}</h3>
                    <p className="text-gray-600 mb-4">
                      <span className="font-semibold text-gray-700">{job.location}</span>
                    </p>

                    <p className="text-gray-700 leading-relaxed mb-5">{job.description}</p>

                    <div className="mb-5">
                      <p className="text-sm font-semibold text-[#0a192f] mb-2">Requirements</p>
                      {job.requirements?.length ? (
                        <ul className="space-y-2">
                          {job.requirements.map((r, i) => (
                            <li key={`${r}-${i}`} className="flex items-start gap-2 text-gray-700">
                              <span className="mt-2 w-1.5 h-1.5 bg-[#f7b733] rounded-full shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No requirements listed.</p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <a
                        href="/contact"
                        className="inline-flex items-center justify-center w-full bg-[#0a192f] hover:bg-black text-white px-4 py-3 font-semibold transition-colors cursor-pointer uppercase tracking-[0.15em] text-sm"
                      >
                        Apply via Contact Form
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

