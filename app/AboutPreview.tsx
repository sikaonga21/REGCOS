'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Buildings, MapPinLine, ShieldCheck } from 'phosphor-react';

export default function AboutPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <p className="text-navy-lighter/80 font-bold text-xs uppercase tracking-[0.3em] mb-4">About Us</p>
            <h2 className="text-4xl font-bold text-navy mb-6 max-w-2xl">
              A Christ-centered academy shaping confident learners and leaders.
            </h2>
            <p className="text-lg text-gray-600 mb-5 leading-relaxed">
              Regcos Christian Academy is a Christ-centered institution committed to nurturing hearts, minds, and futures through quality education rooted in Christian values.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We blend academic excellence with character development, creativity, and compassionate leadership so every child can grow confidently and purposefully.
            </p>
            <div className="space-y-3 mb-10">
              {[
                { icon: Buildings, label: 'Academic excellence with Christian values' },
                { icon: ShieldCheck, label: 'Holistic development and care' },
                { icon: MapPinLine, label: 'A nurturing community for every learner' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4 text-sm text-gray-700 font-medium">
                    <div className="w-12 h-12 bg-gold/20 flex items-center justify-center shrink-0 rounded-2xl shadow-sm">
                      <Icon size={20} weight="fill" className="text-navy" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy border-b-2 border-navy pb-0.5 hover:text-gold-hover hover:border-gold-hover transition-colors"
            >
              Learn More
              <ArrowRight size={14} weight="bold" />
            </Link>
          </motion.div>
          
          <motion.div 
            className="relative overflow-hidden rounded-2xl shadow-2xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <img
              src="/images/peview-png.png"
              alt="Regcos Christian Academy overview"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-6 right-6 flex gap-2">
              <span className="w-2.5 h-2.5 bg-gold block rounded-full" />
              <span className="w-2.5 h-2.5 bg-navy block opacity-60 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}