'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import EnrollmentForm from './EnrollmentForm';
import { motion } from 'framer-motion';

export default function EnrollPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      
      {/* Hero Header for Enrollment Page */}
      <div className="pt-32 pb-16 bg-navy relative overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Begin Your Journey
            </h1>
            <p className="text-xl text-gray-300">
              Join Regcos Christian Academy and give your child a foundation of faith, character, and academic excellence.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="flex-grow -mt-8 relative z-20">
        <EnrollmentForm />
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
