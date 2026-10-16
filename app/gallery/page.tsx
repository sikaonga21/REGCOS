'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'phosphor-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InnerPageHero from '@/components/InnerPageHero';
import WhatsAppButton from '@/components/WhatsAppButton';
import GalleryGrid from './GalleryGrid';

export default function GalleryPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <InnerPageHero
          eyebrow="Gallery"
          title="Life at Regcos Christian Academy"
          description="Step inside our classrooms, music room, ICT lab and playground, and see the everyday moments that shape our learners."
          backgroundImage="/images/gallery/classroom-hands-up.jpg"
        />

        <GalleryGrid />

        <section className="bg-navy py-20">
          <motion.div
            className="container mx-auto px-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="mb-5 text-4xl font-bold text-white">Come and See for Yourself</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300">
              Photos only tell part of the story. Book a visit and meet the teachers, see the
              classrooms, and find out whether Regcos is the right home for your child.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/enroll"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-10 py-4 text-sm font-bold uppercase tracking-wider text-navy shadow-lg shadow-gold/25 transition-all duration-300 hover:scale-105 hover:bg-gold-hover"
              >
                Enroll Now
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-sm border border-white/30 bg-white/10 px-10 py-4 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
              >
                Book a Visit
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
