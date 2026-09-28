
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'phosphor-react';

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
    alt: 'Students playing outside at school',
  },
  {
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80',
    alt: 'Children learning together in a bright classroom',
  },
  {
    url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80',
    alt: 'Happy school children at the playground',
  },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen w-full min-w-0 overflow-hidden bg-[#f5f7fb]">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.url}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${slide.url}')` }}
            aria-label={slide.alt}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/30" />
      </div>

      <motion.div
        className="container mx-auto px-4 md:px-8 h-full relative z-10 flex items-center pt-20 lg:pt-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="max-w-4xl text-white">
          <motion.p
            className="text-gold text-sm font-bold uppercase tracking-[0.3em] mb-5 text-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Regcos Christian Academy
          </motion.p>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            The Best Place For Your Kids!
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/85 font-light leading-relaxed mb-10 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            We are a Christ-centered institution dedicated to nurturing hearts, minds, and futures through academic excellence, strong Christian values, and joyful learning.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <Link
              href="/enroll"
              className="bg-gold hover:bg-gold-hover text-navy px-10 py-4 font-bold uppercase tracking-wider text-sm transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg shadow-gold/25 rounded-sm hover:scale-105 hover:shadow-gold/40"
            >
              Enroll Now
              <ArrowRight size={16} weight="bold" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/30 px-10 py-4 font-bold uppercase tracking-wider text-sm transition-all duration-300 rounded-sm hover:scale-105"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.url}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeSlide ? 'w-10 bg-gold' : 'w-2.5 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
