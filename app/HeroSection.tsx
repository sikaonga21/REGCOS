
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'phosphor-react';

export default function HeroSection() {
  return (
    <section
      className="relative h-screen w-full min-w-0 overflow-hidden bg-navy"
      style={{
        backgroundImage: `url('https://readdy.ai/api/search-image?query=Premium%20Christian%20Academy%20campus%20exterior%2C%20beautiful%20modern%20school%20building%20with%20green%20lawns%2C%20happy%20students%20walking%2C%20warm%20golden%20hour%20lighting%2C%20professional%20architectural%20photography%2C%20cinematic%204k&width=1920&height=1080&seq=hero-main-001&orientation=landscape')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-navy/30"></div>

      <motion.div
        className="container mx-auto px-4 md:px-8 h-full relative z-10 flex items-center pt-20 lg:pt-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
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
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            The Best Place For Your Kids!
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 font-light leading-relaxed mb-10 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            We are a Christ-centered institution dedicated to nurturing hearts, minds, and futures through academic excellence, strong Christian values, and joyful learning.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
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
    </section>
  );
}
