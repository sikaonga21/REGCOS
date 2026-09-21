'use client';

import { motion } from 'framer-motion';
import { Medal, IdentificationBadge, Handshake, MapPinLine, Scales, Users } from 'phosphor-react';

const reasons = [
  {
    icon: Medal,
    title: 'Academic Excellence',
    description:
      'We nurture strong learning foundations so each child can grow in confidence, knowledge, and purpose.',
  },
  {
    icon: IdentificationBadge,
    title: 'Whole-Child Development',
    description:
      'We care for the intellectual, spiritual, emotional, social, and physical growth of every learner.',
  },
  {
    icon: Handshake,
    title: 'Strong Family Partnership',
    description:
      'We work closely with parents and guardians to support each child’s journey with trust and care.',
  },
  {
    icon: MapPinLine,
    title: 'Safe, Inspiring Environment',
    description:
      'Our community is built to help children feel seen, supported, and ready to grow in confidence.',
  },
  {
    icon: Scales,
    title: 'Faith-Based Values',
    description:
      'Christian principles guide our teaching, behavior, and relationships, shaping character and leadership.',
  },
  {
    icon: Users,
    title: 'Personalized Care',
    description:
      'Every learner is valued as unique, with their strengths, needs, and potential thoughtfully supported.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-[#063B82]">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <p className="text-[#FFD400] font-bold text-xs uppercase tracking-[0.3em] mb-4">
            Our Commitment
          </p>
          <h2 className="text-4xl font-bold text-white uppercase leading-tight mb-4">
            Why Choose Regcos?
          </h2>
          <div className="w-12 h-0.5 bg-[#FFD400]" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {reasons.slice(0, 4).map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                className="bg-[#063B82] p-10 flex flex-col group hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <div className="w-11 h-11 bg-[#FFD400]/15 flex items-center justify-center mb-6 group-hover:bg-[#FFD400]/25 transition-colors">
                  <Icon size={20} weight="fill" className="text-[#FFD400]" />
                </div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                  {reason.title}
                </h3>
                <p className="text-white/50 text-xs leading-relaxed">{reason.description}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-white/10 mt-px">
          {reasons.slice(4).map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                className="bg-[#063B82] p-10 flex flex-col group hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <div className="w-11 h-11 bg-[#FFD400]/15 flex items-center justify-center mb-6 group-hover:bg-[#FFD400]/25 transition-colors">
                  <Icon size={20} weight="fill" className="text-[#FFD400]" />
                </div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                  {reason.title}
                </h3>
                <p className="text-white/50 text-xs leading-relaxed">{reason.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
