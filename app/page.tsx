
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import HeroSection from './HeroSection';
import AboutPreview from './AboutPreview';
import ServicesPreview from './ServicesPreview';
import ProcessSection from './services/ProcessSection';
import TrustSection from './TrustSection';
import GalleryPreview from './GalleryPreview';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutPreview />
        <ServicesPreview />
        <ProcessSection />
        <TrustSection />
        <GalleryPreview />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
