'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MagnifyingGlassPlus, X } from 'phosphor-react';
import { galleryCategories, galleryPhotos, type GalleryCategory } from '@/lib/gallery';

type Filter = 'All' | GalleryCategory;

const filters: Filter[] = ['All', ...galleryCategories];

export default function GalleryGrid() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = useMemo(
    () =>
      activeFilter === 'All'
        ? galleryPhotos
        : galleryPhotos.filter((photo) => photo.category === activeFilter),
    [activeFilter]
  );

  const showNext = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % photos.length));
  }, [photos.length]);

  const showPrevious = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  /* Keyboard control + scroll lock while the lightbox is open */
  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') showNext();
      if (event.key === 'ArrowLeft') showPrevious();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIndex, showNext, showPrevious]);

  const activePhoto = lightboxIndex === null ? null : photos[lightboxIndex];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <p className="text-navy-lighter/80 font-bold text-xs uppercase tracking-[0.3em] mb-4">
            Our Gallery
          </p>
          <h2 className="text-4xl font-bold text-navy mb-4 max-w-3xl">A Day at Regcos</h2>
          <div className="w-12 h-0.5 bg-gold mb-4" />
          <p className="text-lg text-gray-600 max-w-3xl">
            Lessons, music, technology, play, mealtimes and prayer — real moments from our
            classrooms and grounds.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="mb-12 flex flex-wrap gap-3">
          {filters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setLightboxIndex(null);
                }}
                aria-pressed={isActive}
                className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                  isActive
                    ? 'bg-navy text-white shadow-lg shadow-navy/20'
                    : 'bg-cream text-navy hover:bg-cream-dark'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Masonry-style grid: portraits take a taller cell */}
        <motion.div layout className="columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]">
          <AnimatePresence mode="popLayout">
            {photos.map((photo, index) => (
              <motion.button
                key={photo.src}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                onClick={() => setLightboxIndex(index)}
                aria-label={`View larger: ${photo.caption}`}
                className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-cream text-left shadow-md transition-shadow duration-300 hover:shadow-2xl"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Caption overlay */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold mb-1.5">
                      {photo.category}
                    </p>
                    <p className="text-sm font-medium text-white">{photo.caption}</p>
                  </div>
                </div>

                <span className="pointer-events-none absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                  <MagnifyingGlassPlus size={18} weight="bold" className="text-navy" />
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.caption}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <X size={22} weight="bold" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 md:left-8"
            >
              <ArrowLeft size={22} weight="bold" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 md:right-8"
            >
              <ArrowRight size={22} weight="bold" />
            </button>

            <motion.figure
              key={activePhoto.src}
              className="max-h-full w-full max-w-5xl"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                width={activePhoto.width}
                height={activePhoto.height}
                className="mx-auto max-h-[78vh] w-auto rounded-xl object-contain shadow-2xl"
              />
              <figcaption className="mt-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">
                  {activePhoto.category}
                </p>
                <p className="text-base text-white/90">{activePhoto.caption}</p>
                <p className="mt-2 text-xs text-white/50">
                  {lightboxIndex! + 1} / {photos.length}
                </p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
