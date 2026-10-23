'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Family Consultation',
    description: 'Meet our admissions team to discuss your child’s needs and learning journey.',
  },
  {
    number: '02',
    title: 'Campus Visit',
    description: 'Explore our classrooms, meet our educators, and experience our school community.',
  },
  {
    number: '03',
    title: 'Application',
    description: 'Complete the application and share the information we need to support your child.',
  },
  {
    number: '04',
    title: 'Enrollment',
    description: 'Confirm your child’s place and complete the enrollment arrangements with our team.',
  },
  {
    number: '05',
    title: 'Welcome to Regcos',
    description: 'Join our school community and receive support as your child begins their journey.',
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
          <h2 className="text-4xl font-bold text-white uppercase leading-tight mb-4">
            Our Process
          </h2>
          <div className="w-12 h-0.5 bg-[#FFD400] mb-4" />
          <p className="text-white/60 max-w-2xl text-sm leading-relaxed">
            A caring, step-by-step admissions journey to help your child learn, grow, and thrive.
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
