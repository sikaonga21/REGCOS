'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Scales, Medal, Star, Users, IdentificationBadge } from 'phosphor-react';

const values = [
  {
    icon: ShieldCheck,
    title: 'Reliability & Diligence',
    description:
      'We deliver on our promises with unwavering dedication and thorough execution in every project we undertake.',
  },
  {
    icon: Scales,
    title: 'Accountability',
    description:
      'We take full responsibility for our actions and commitments, ensuring transparency in all our dealings.',
  },
  {
    icon: Medal,
    title: 'Service Excellence',
    description:
      'We strive to exceed expectations through superior service delivery and attention to detail.',
  },
  {
    icon: IdentificationBadge,
    title: 'Integrity',
    description:
      'We conduct our business with the highest ethical standards, building trust through honest and fair practices.',
  },
  {
    icon: Star,
    title: 'Quality Products & Services',
    description:
      'We maintain the highest standards in all our offerings, from land development to property management.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description:
      'Our clients are at the heart of everything we do. Their success and satisfaction drive our decisions.',
  },
];

export default function CoreValues() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <p className="text-[#063B82]/50 font-bold text-xs uppercase tracking-[0.3em] mb-4">
            What Guides Us
          </p>
          <h2 className="text-4xl font-bold text-[#063B82] uppercase leading-tight mb-4">
            Our Core Values
          </h2>
          <div className="w-12 h-0.5 bg-[#FFD400] mb-4" />
          <p className="text-lg text-gray-600 max-w-2xl">
            These principles guide every decision we make and every service we provide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                className="bg-white p-10 flex flex-col group hover:bg-[#F3F5F8] transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <div className="w-11 h-11 bg-[#063B82] flex items-center justify-center mb-6 group-hover:bg-[#FFD400] transition-colors">
                  <Icon size={20} weight="fill" className="text-white" />
                </div>
                <h3 className="font-bold text-[#063B82] text-xs uppercase tracking-wider mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
