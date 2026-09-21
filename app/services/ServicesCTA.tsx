'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'phosphor-react';

export default function ServicesCTA() {
  return (
    <section className="flex flex-col lg:flex-row">
      <motion.div
        className="lg:w-3/5 px-10 py-24 md:px-20 flex flex-col justify-center bg-[#f7b733]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <p className="font-bold text-xs uppercase tracking-[0.3em] text-black/50 mb-6">
          Take the Next Step
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-black uppercase leading-tight mb-6">
          Ready to Enroll?
        </h2>
        <p className="text-black/70 text-base mb-10 max-w-xl leading-relaxed">
          We welcome families who want a Christ-centered learning environment where academic excellence and character development go hand in hand.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border border-black px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-black hover:text-[#f7b733] transition-all duration-300"
          >
            Enroll Now
            <ArrowRight size={16} weight="bold" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center bg-black text-white px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-[#0a192f] transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="lg:w-2/5 h-64 lg:h-auto overflow-hidden bg-[#0a192f] relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <img
          src="/images/estates/greatnorth-estate.png"
          alt="Regcos Christian Academy services"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/10 text-7xl font-bold uppercase tracking-widest">RCA</div>
        </div>
      </motion.div>
    </section>
  );
}
