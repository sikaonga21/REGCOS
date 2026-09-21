'use client';

import { motion } from 'framer-motion';
import { ClockCounterClockwise, Eye, MapPin, ShieldCheck } from 'phosphor-react';

export default function TrustSection() {
  const trustPoints = [
    {
      icon: ShieldCheck,
      title: 'Faith-Led Education',
      description: 'Our learners are guided by Christian values that shape character, conduct, and purpose.'
    },
    {
      icon: Eye,
      title: 'Focused Learning',
      description: 'We support strong literacy, numeracy, creativity, and critical thinking from the earliest years.'
    },
    {
      icon: MapPin,
      title: 'Nurturing Environment',
      description: 'Every child is cared for in a safe, encouraging, and developmentally supportive setting.'
    },
    {
      icon: ClockCounterClockwise,
      title: 'Lifelong Growth',
      description: 'We prepare children to flourish academically, socially, spiritually, and emotionally.'
    }
  ];

  return (
    <section className="py-20 bg-navy">
      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="text-gold font-bold text-xs uppercase tracking-[0.3em] mb-4 text-glow">Why Parents Choose Us</p>
          <h2 className="text-4xl font-bold text-white mb-4 max-w-3xl">
            Why Choose Regcos Christian Academy?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl">
            We believe every child deserves a safe, loving, and purposeful learning environment where faith, character, and excellence grow together.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustPoints.map((point, index) => (
            <motion.div
              key={index} 
              className="glass hover:glass-dark rounded-2xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <point.icon size={26} weight="fill" className="text-gold" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 uppercase leading-tight">{point.title}</h3>
              <p className="text-gray-300 leading-relaxed text-sm">{point.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="glass p-12 max-w-4xl mx-auto rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Your Child’s Journey?</h3>
              <p className="text-gray-200 mb-8 max-w-2xl mx-auto text-lg">Enroll your child in a learning environment designed to inspire excellence, confidence, and character.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/enroll" 
                  className="bg-gold hover:bg-gold-hover text-navy px-8 py-4 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-gold/20"
                >
                  Enroll Now
                </a>
                <a 
                  href="/about" 
                  className="border-2 border-gold text-gold hover:bg-gold hover:text-navy px-8 py-4 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-300"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}