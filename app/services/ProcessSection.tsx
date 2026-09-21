'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Initial Consultation',
    description: 'We discuss your property needs and provide expert advice on available options.',
  },
  {
    number: '02',
    title: 'Site Inspection',
    description: 'Professional site visit and evaluation to ensure the property meets your requirements.',
  },
  {
    number: '03',
    title: 'Documentation',
    description: 'Complete all necessary paperwork and legal documentation for your peace of mind.',
  },
  {
    number: '04',
    title: 'Payment Processing',
    description: 'Flexible payment options with transparent pricing and no hidden fees.',
  },
  {
    number: '05',
    title: 'Property Handover',
    description: 'Official handover with all necessary documents and ongoing support.',
  },
];

export default function ProcessSection() {
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
            How It Works
          </p>
          <h2 className="text-4xl font-bold text-white uppercase leading-tight mb-4">
            Our Process
          </h2>
          <div className="w-12 h-0.5 bg-[#FFD400] mb-4" />
          <p className="text-white/60 max-w-2xl text-sm leading-relaxed">
            A streamlined approach to make your property acquisition journey smooth and hassle-free.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="bg-[#063B82] p-10 flex flex-col group hover:bg-white/5 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
              viewport={{ once: true, margin: '-50px' }}
            >
              {/* Number badge */}
              <div className="w-11 h-11 bg-[#FFD400] flex items-center justify-center mb-6 shrink-0">
                <span className="text-[#063B82] font-bold text-sm">{step.number}</span>
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                {step.title}
              </h3>
              <p className="text-white/50 text-xs leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
