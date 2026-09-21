'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, MapPinLine, Buildings } from 'phosphor-react';

export default function ServicesPreview() {
  const services = [
    {
      icon: MapPinLine,
      eyebrow: 'Learning',
      title: 'Great Teachers',
      description:
        'Passionate, caring educators who inspire excellence, character, and a love for learning in every child.',
      points: ['Dedicated guidance', 'Strong mentorship', 'Joyful learning'],
      image: 'https://readdy.ai/api/search-image?query=passionate%20teacher%20with%20students%20in%20bright%20classroom%2C%20happy%20learning%20environment%2C%20modern%20school%20classroom%2C%20warm%20natural%20lighting%2C%20cinematic%20photography&width=1200&height=800&seq=school-service-1&orientation=landscape',
      reverse: false,
    },
    {
      icon: Buildings,
      eyebrow: 'Creativity',
      title: 'Music Program',
      description:
        'Where creativity finds its rhythm and young talents are nurtured in our state-of-the-art music program.',
      points: ['Talent development', 'Creative confidence', 'Arts enrichment'],
      image: 'https://readdy.ai/api/search-image?query=children%20learning%20music%20in%20school%20music%20room%2C%20happy%20young%20students%20playing%20instruments%2C%20bright%20creative%20school%20environment%2C%20premium%20photography&width=1200&height=800&seq=school-service-2&orientation=landscape',
      reverse: true,
    },
    {
      icon: FileText,
      eyebrow: 'Growth',
      title: 'Sports Training',
      description:
        'Building strong bodies, teamwork, and confidence through fun and structured sports activities.',
      points: ['Teamwork', 'Healthy habits', 'Confidence building'],
      image: 'https://readdy.ai/api/search-image?query=school%20students%20playing%20sports%20together%20on%20field%2C%20teamwork%2C%20healthy%20active%20children%2C%20youthful%20school%20athletics%2C%20golden%20hour&width=1200&height=800&seq=school-service-3&orientation=landscape',
      reverse: false,
    },
  ];

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 pt-20 pb-40">
        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Eyebrow - muted dark on white background */}
          <p className="text-navy-lighter/80 font-bold text-xs uppercase tracking-[0.3em] mb-4">
            What We Do
          </p>
          <h2 className="text-4xl font-bold text-navy mb-4 max-w-3xl">
            A School Experience Designed for Growth and Joy
          </h2>
          <div className="w-12 h-0.5 bg-gold mb-4" />
          <p className="text-lg text-gray-600 max-w-3xl">
            We cultivate a supportive environment where every child can discover their strengths,
            build confidence, and grow in faith, knowledge, and character.
          </p>
        </motion.div>

        {/* Split-section service rows */}
        <div className="space-y-0 mb-16">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className={`grid lg:grid-cols-2 overflow-hidden rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300 mb-8 ${
                  service.reverse ? 'bg-cream-dark' : 'bg-white'
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, x: service.reverse ? 80 : -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: '-80px' }}
                  className={`flex flex-col justify-center px-8 py-16 md:px-14 ${
                    service.reverse ? 'lg:order-2' : ''
                  }`}
                >
                  {/* Icon box */}
                  <div className="w-14 h-14 bg-navy flex items-center justify-center mb-6 rounded-2xl shadow-lg">
                    <Icon size={26} weight="fill" className="text-gold" />
                  </div>
                  {/* Eyebrow */}
                  <p className="text-navy-lighter/80 font-bold text-xs uppercase tracking-[0.3em] mb-4">
                    {service.eyebrow}
                  </p>
                  <h3 className="text-3xl font-bold text-navy uppercase leading-tight mb-4">
                    {service.title}
                  </h3>
                  <div className="w-12 h-0.5 bg-gold mb-6" />
                  <p className="text-gray-600 leading-relaxed mb-8">{service.description}</p>
                  <ul className="space-y-3 mb-8">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-gold block shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy border-b-2 border-navy pb-0.5 hover:text-gold-hover hover:border-gold-hover transition-colors self-start group"
                  >
                    Learn More
                    <ArrowRight
                      size={14}
                      weight="bold"
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: service.reverse ? -80 : 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: '-80px' }}
                  className={`relative overflow-hidden h-[320px] lg:h-auto ${
                    service.reverse ? 'lg:order-1' : ''
                  }`}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-6 right-6 flex gap-2">
                    <span className="w-2.5 h-2.5 bg-gold block rounded-full" />
                    <span className="w-2.5 h-2.5 bg-navy block opacity-60 rounded-full" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* CTA button - clear space above the next section */}
        <motion.div
          className="text-center pt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <Link
            href="/services"
            className="bg-gold hover:bg-gold-hover text-navy shadow-lg shadow-gold/20 px-10 py-4 font-bold uppercase tracking-wider text-sm transition-all rounded-sm inline-block hover:scale-105"
          >
            Explore More
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
