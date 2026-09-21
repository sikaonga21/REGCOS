'use client';

import { motion } from 'framer-motion';

type InnerPageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  backgroundImage?: string;
};

export default function InnerPageHero({
  eyebrow,
  title,
  description,
  backgroundImage,
}: InnerPageHeroProps) {
  return (
    <section
      className="relative min-h-[420px] overflow-hidden bg-[#1f2547]"
      style={
        backgroundImage
          ? {
              backgroundImage: `url('${backgroundImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#1f2547]/90 via-[#554e9f]/75 to-[#fda00f]/25" />

      <div className="relative container mx-auto px-4 pt-36 pb-16 md:pt-40 md:pb-20">
        <motion.p
          className="text-[#fda00f] font-bold text-xs uppercase tracking-[0.3em] mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          className="max-w-4xl text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase leading-tight mb-6"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: 'easeOut' }}
        >
          {title}
        </motion.h1>
        <motion.div
          className="w-14 h-0.5 bg-[#fda00f] mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          style={{ originX: 0 }}
        />
        <motion.p
          className="max-w-2xl text-lg md:text-xl text-white/75 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
