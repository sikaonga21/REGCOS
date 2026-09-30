'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ServicesHero from '../services/ServicesHero';
import ServicesList from '../services/ServicesList';
import OurClients from '../services/OurClients';
import ProcessSection from '../services/ProcessSection';
import ServicesCTA from '../services/ServicesCTA';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ServicesHero />
        <ServicesList />
        <OurClients />
        <ProcessSection />
        <ServicesCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}