'use client';

import { Bus, Car, Clock, MapPinLine, Phone } from 'phosphor-react';

export default function LocationMap() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <p className="text-[#063B82]/50 font-bold text-xs uppercase tracking-[0.3em] mb-4">Location</p>
          <h2 className="text-4xl font-bold text-[#063B82] uppercase mb-4">Our Location</h2>
          <div className="w-12 h-0.5 bg-[#FFD400] mb-4" />
          <p className="text-lg text-gray-600">
            Visit our campus in Woodlands and meet our team for an admission conversation.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-[#F3F5F8] p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-[#063B82] mb-6">Campus Location</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPinLine size={20} weight="fill" className="text-[#063B82] mr-4 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-[#063B82] mb-1">Address</h4>
                  <p className="text-gray-700">Stand No. 12305, Woodlands</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone size={20} weight="fill" className="text-[#063B82] mr-4 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-[#063B82] mb-1">Phone</h4>
                  <p className="text-gray-700">+260 975 141 977</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock size={20} weight="fill" className="text-[#063B82] mr-4 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-[#063B82] mb-1">Business Hours</h4>
                  <p className="text-gray-700">
                    Monday - Friday: 8:00 AM - 5:00 PM<br/>
                    Saturday: 8:00 AM - 1:00 PM<br/>
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold text-[#063B82] mb-4">How to Get There</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <Car size={16} weight="fill" className="text-[#063B82] mr-3" />
                  Parking available on-site
                </li>
                <li className="flex items-center">
                  <Bus size={16} weight="fill" className="text-[#063B82] mr-3" />
                  Public transport accessible
                </li>
                <li className="flex items-center">
                  <MapPinLine size={16} weight="fill" className="text-[#063B82] mr-3" />
                  <a href="https://maps.app.goo.gl/ARU2uudKDacEDi6F7" target="_blank" rel="noopener noreferrer" className="text-[#063B82] hover:underline font-semibold">
                    View on Google Maps
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="h-[400px] md:h-full rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3850.123456789!2d28.6367!3d-12.9542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU3JzE1LjEiUyAyOMKwMzgnMTIuMSJF!5e0!3m2!1sen!2szm!4v1730000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Regcos Christian Academy Ndola Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}