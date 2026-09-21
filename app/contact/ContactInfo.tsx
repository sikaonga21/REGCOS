
'use client';

import { Clock, EnvelopeSimple, MapPinLine, Phone } from 'phosphor-react';

export default function ContactInfo() {
  const offices = [
    {
      city: 'Woodlands',
      title: 'Main Campus',
      address: 'Stand No. 12305, Woodlands',
      phone: '+260 975 141 977',
      email: 'admin@regcoschristianacademy.com',
    },
    {
      city: 'Admissions',
      title: 'Office Desk',
      address: 'Call or email for school enrollment information',
      phone: '+260 978 900 184',
      email: 'regcoschristianacademy@gmail.com',
    },
    {
      city: 'Support',
      title: 'General Enquiries',
      address: 'Appointments and school visits by arrangement',
      phone: '+260 965 423 585',
      email: 'admin@regcoschristianacademy.com',
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <p className="text-[#063B82]/50 font-bold text-xs uppercase tracking-[0.3em] mb-4">Our Offices</p>
          <h2 className="text-4xl font-bold text-[#063B82] uppercase mb-4">Visit Us Across Zambia</h2>
          <div className="w-12 h-0.5 bg-[#FFD400] mb-4" />
          <p className="text-lg text-gray-600">Visit us at any of our convenient locations across Zambia.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-gray-200">
          {offices.map((office, index) => (
            <div key={index} className="bg-white p-10 text-center hover:bg-[#F3F5F8] transition-colors">
              <div className="w-11 h-11 bg-[#063B82] flex items-center justify-center mx-auto mb-6">
                <MapPinLine size={20} weight="fill" className="text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#063B82] mb-2">{office.city}</h3>
              <p className="text-[#063B82]/55 font-semibold uppercase tracking-[0.18em] text-xs mb-6">{office.title}</p>
              
              <div className="space-y-4 text-gray-600">
                <div className="flex items-center justify-center">
                  <MapPinLine size={16} weight="fill" className="text-[#063B82] mr-2 shrink-0" />
                  <span className="text-sm">{office.address}</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <Phone size={16} weight="fill" className="text-[#063B82] mr-2 shrink-0" />
                  <span className="text-sm">{office.phone}</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <EnvelopeSimple size={16} weight="fill" className="text-[#063B82] mr-2 shrink-0" />
                  <span className="text-sm">{office.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="bg-[#F3F5F8] p-8 max-w-4xl mx-auto border border-gray-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock size={20} weight="fill" className="text-[#063B82]" />
              <h3 className="text-2xl font-bold text-[#063B82]">Business Hours</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-gray-600">
              <div>
                <h4 className="font-semibold text-[#063B82] mb-2">Weekdays</h4>
                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#063B82] mb-2">Weekends</h4>
                <p>Saturday: 8:00 AM - 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
