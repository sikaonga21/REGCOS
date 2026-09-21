'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'phosphor-react';

export default function CTASection() {
  return (
    <section className="flex flex-col lg:flex-row">
      <motion.div
        className="lg:w-3/5 px-10 py-24 md:px-20 flex flex-col justify-center bg-[#ff9f1c]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <p className="font-bold text-xs uppercase tracking-[0.3em] text-black/50 mb-6">Start Here</p>
        <h2 className="text-4xl md:text-5xl font-bold text-black uppercase leading-tight mb-6">
          Ready to Make the
          <br />
          Right Choice?
        </h2>
        <p className="text-black/70 text-base mb-10 max-w-xl leading-relaxed">
          At Regcos Christian Academy, we believe every child deserves a joyful and faith-filled environment where learning, creativity, and strong values thrive.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border border-black px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-black hover:text-[#ff9f1c] transition-all duration-300"
          >
            Enroll Now
            <ArrowRight size={16} weight="bold" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center bg-black text-white px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-[#1f2547] transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="lg:w-2/5 h-64 lg:h-auto overflow-hidden bg-[#1a5f8b] relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <img
          src="/images/estates/paramount-estate.jpeg"
          alt="Regcos Christian Academy campus"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/15 text-7xl font-bold uppercase tracking-widest">RCA</div>
        </div>
      </motion.div>
    </section>
  );
}