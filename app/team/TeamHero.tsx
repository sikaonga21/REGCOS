'use client';

import { motion } from 'framer-motion';

export default function TeamHero() {
  return (
    <section
      className="relative h-[100vh] mt-[60px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <motion.div
        className="relative z-10 text-center text-white max-w-4xl px-4 mt-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          Our Leadership
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl font-light"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          Meet the leaders guiding Regcos Christian Academy with faith, wisdom, and care.
        </motion.p>
      </motion.div>
    </section>
  );
}