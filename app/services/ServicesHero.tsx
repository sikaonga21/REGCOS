'use client';

import { motion } from 'framer-motion';

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-[#063B82]">
      <div className="container mx-auto grid min-h-[520px] items-center gap-10 px-4 pb-16 pt-36 md:px-8 md:pb-20 md:pt-40 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:py-28">
        <motion.div
          className="relative z-10 lg:pr-8"
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#FFD400]">
            About
          </p>
          <h1 className="mb-6 max-w-xl text-4xl font-bold uppercase leading-tight text-white md:text-5xl lg:text-6xl">
            A Holistic Learning Experience
          </h1>
          <div className="mb-6 h-0.5 w-14 bg-[#FFD400]" />
          <p className="max-w-lg text-lg leading-relaxed text-white/80 md:text-xl">
            We provide a purposeful and faith-filled learning journey where every child can discover their talents, grow in confidence, and flourish academically and spiritually.
          </p>
        </motion.div>

        <motion.div
          className="relative h-[300px] md:h-[400px] lg:-mr-20 lg:h-[460px]"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
            alt="Students learning together"
            className="h-full w-full object-cover"
          />
          <div className="absolute -bottom-5 -left-5 h-24 w-24 border-l-8 border-b-8 border-[#FFD400] md:h-32 md:w-32" />
          <div className="absolute right-6 top-6 flex gap-2">
            <span className="block h-2.5 w-2.5 bg-[#FFD400]" />
            <span className="block h-2.5 w-2.5 bg-white/60" />
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 h-1.5 w-1/3 bg-[#FFD400]" />
    </section>
  );
}
