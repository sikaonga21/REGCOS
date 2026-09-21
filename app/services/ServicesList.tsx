'use client';

import { motion } from 'framer-motion';
import { HouseLine, MapPinLine, Megaphone, Gear, FileText, Buildings, Check } from 'phosphor-react';

const services = [
  {
    icon: HouseLine,
    title: 'Great Teachers',
    description:
      'Passionate, caring educators who inspire excellence, character, and a love for learning in every child.',
    features: ['Dedicated educators', 'Strong mentorship', 'Positive role models', 'Curriculum support'],
  },
  {
    icon: MapPinLine,
    title: 'Music Program',
    description:
      'Where creativity finds its rhythm and young talents are nurtured in a vibrant, state-of-the-art music environment.',
    features: ['Creative expression', 'Talent development', 'Confidence building', 'Music appreciation'],
  },
  {
    icon: Megaphone,
    title: 'Sports Training',
    description:
      'Building strong bodies, teamwork, and confidence through fun and structured sports activities.',
    features: ['Teamwork', 'Healthy lifestyles', 'Confidence', 'Physical growth'],
  },
  {
    icon: Gear,
    title: 'Skills Recognition',
    description:
      'Celebrating every child’s unique talents by identifying, nurturing, and rewarding their gifts.',
    features: ['Talent discovery', 'Encouragement', 'Personal growth', 'Achievement celebration'],
  },
  {
    icon: FileText,
    title: 'Early Learning Excellence',
    description:
      'We focus on building essential skills in literacy, numeracy, creativity, and character during the most important years of development.',
    features: ['Literacy', 'Numeracy', 'Creativity', 'Character building'],
  },
  {
    icon: Buildings,
    title: 'Faith-Led Discovery',
    description:
      'Our learners explore, create, and discover through hands-on activities, music, early technology, and faith-based teaching.',
    features: ['Discovery-based learning', 'Technology exposure', 'Hands-on activities', 'Faith-based growth'],
  },
];

export default function ServicesList() {
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
            Full Offering
          </p>
          <h2 className="text-4xl font-bold text-[#063B82] uppercase leading-tight mb-4">
            Our Programs
          </h2>
          <div className="w-12 h-0.5 bg-[#FFD400] mb-4" />
          <p className="text-lg text-gray-600 max-w-2xl">
            We create a joyful, faith-filled learning experience that helps each child grow in knowledge, character, and confidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                className="bg-white p-10 flex flex-col group hover:bg-[#F3F5F8] transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                viewport={{ once: true, margin: '-50px' }}
              >
                {/* Dark icon box */}
                <div className="w-11 h-11 bg-[#063B82] flex items-center justify-center mb-6 group-hover:bg-[#FFD400] transition-colors">
                  <Icon size={20} weight="fill" className="text-white" />
                </div>
                <h3 className="font-bold text-[#063B82] text-sm uppercase tracking-wider mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <Check size={12} weight="bold" className="text-[#063B82] shrink-0" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
