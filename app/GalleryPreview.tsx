'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'phosphor-react';
import { galleryHighlights } from '@/lib/gallery';

export default function GalleryPreview() {
  return (
    <section className="bg-cream py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-navy-lighter/80">
              Our Gallery
            </p>
            <h2 className="mb-4 max-w-2xl text-4xl font-bold text-navy">
              See a Day in the Life of Our School
            </h2>
            <div className="mb-4 h-0.5 w-12 bg-gold" />
            <p className="max-w-2xl text-lg text-gray-600">
              From morning lessons to music practice, the ICT lab and the playground — this is
              Regcos Christian Academy as our learners experience it.
            </p>
          </div>

          <Link
            href="/gallery"
            className="group inline-flex shrink-0 items-center gap-2 self-start border-b-2 border-navy pb-0.5 text-xs font-bold uppercase tracking-[0.2em] text-navy transition-colors hover:border-gold-hover hover:text-gold-hover md:self-auto"
          >
            View Full Gallery
            <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 auto-rows-[150px] gap-4 sm:auto-rows-[190px] md:grid-cols-4 lg:auto-rows-[220px]">
          {galleryHighlights.map((photo, index) => (
            <motion.div
              key={photo.src}
              /* Lead tile spans 2x2 so the five photos read as a collage, not a strip */
              className={`group relative overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-2xl ${
                index === 0 ? 'col-span-2 row-span-2' : ''
              }`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
              viewport={{ once: true, margin: '-60px' }}
            >
              <Link href="/gallery" className="block h-full w-full">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                      {photo.category}
                    </p>
                    <p className="text-sm font-medium text-white">{photo.caption}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
