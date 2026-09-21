'use client';

import { motion } from 'framer-motion';
import { Quotes, Star } from 'phosphor-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Parent 1',
      location: 'Woodlands',
      image: 'https://readdy.ai/api/search-image?query=happy%20parent%20smiling%20with%20child%2C%20warm%20family%20portrait%2C%20confident%20parent%2C%20natural%20light%2C%20friendly%20home%20background&width=80&height=80&seq=testimonial-001&orientation=squarish',
      text: 'Regcos Christian Academy has created a warm and inspiring place where our child is growing in confidence, kindness, and academic strength.',
      rating: 5
    },
    {
      name: 'Parent 2',
      location: 'School Community',
      image: 'https://readdy.ai/api/search-image?query=confident%20mother%20with%20young%20child%20smiling%2C%20family%20portrait%2C%20happy%20home%20environment%2C%20warm%20lighting&width=80&height=80&seq=testimonial-002&orientation=squarish',
      text: 'The teachers are caring and dedicated. My child loves learning here and is developing both spiritually and academically.',
      rating: 5
    },
    {
      name: 'Parent 3',
      location: 'Rockfield/Woodlands',
      image: 'https://readdy.ai/api/search-image?query=joyful%20father%20with%20school-aged%20child%20smiling%2C%20friendly%20family%20photo%2C%20bright%20natural%20light&width=80&height=80&seq=testimonial-003&orientation=squarish',
      text: 'We chose Regcos because of the faith-filled environment, excellent care, and the focus on whole-child development for every learner.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="text-gold font-bold text-xs uppercase tracking-[0.3em] mb-4">Parent Voices</p>
          <h2 className="text-4xl font-bold text-navy mb-4 max-w-3xl">
            What Parents Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl">
            Families trust Regcos Christian Academy because we nurture every child with care, faith, and purposeful learning.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <Quotes size={32} weight="fill" className="text-gold/40 mb-5" />
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} weight="fill" className="text-gold" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-gold/20"
                />
                <div>
                  <h4 className="font-semibold text-navy">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}