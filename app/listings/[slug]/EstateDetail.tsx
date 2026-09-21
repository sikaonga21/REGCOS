'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import Link from 'next/link';
import { type ListingItem } from '@/lib/supabase';

const formatMaybeNumber = (v: unknown) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v.toLocaleString();
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n.toLocaleString();
  }
  return null;
};

interface EstateDetailProps {
  listing: ListingItem;
}

export default function EstateDetail({ listing }: EstateDetailProps) {
  const gallery = [listing.image_url, ...(listing.gallery_urls ?? [])].filter(Boolean) as string[];
  const images = gallery.length ? gallery.slice(0, 4) : ['/images/logoo.png'];

  const listingKindLabel = listing.listing_kind === 'plot' ? 'Plot' : 'House';
  const transactionLabel = listing.transaction_type === 'sale' ? 'For Sale' : 'For Rent';

  const pricingRows = (() => {
    const p = (listing.pricing ?? {}) as Record<string, unknown>;
    const rows: Array<{ label: string; value: string }> = [];

    if (listing.transaction_type === 'sale') {
      const cash = formatMaybeNumber(p.cash ?? p.cash_min ?? p.price_cash);
      if (cash) rows.push({ label: 'Cash', value: `K${cash}` });

      const m6 = formatMaybeNumber(p.months6 ?? p.m6 ?? p['6m']);
      if (m6) rows.push({ label: '6 Months', value: `K${m6}` });

      const m12 = formatMaybeNumber(p.months12 ?? p.m12 ?? p['12m']);
      if (m12) rows.push({ label: '12 Months', value: `K${m12}` });

      const m24 = formatMaybeNumber(p.months24 ?? p.m24 ?? p['24m']);
      if (m24) rows.push({ label: '24 Months', value: `K${m24}` });
    } else {
      const monthly = formatMaybeNumber(p.monthly ?? p.rent_monthly ?? p.monthly_min);
      if (monthly) rows.push({ label: 'Monthly Rent', value: `K${monthly}/mo` });
    }

    return rows;
  })();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="py-12 bg-[#F3F5F8]">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link href="/listings" className="text-[#FFD400] hover:text-[#e6bf00] transition-colors cursor-pointer">
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Listings
              </Link>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                  <img 
                    src={images[0]}
                    alt={listing.title}
                    className="w-full h-96 object-cover object-top"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {images.slice(1).map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-48 object-cover object-top rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                    />
                  ))}
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h1 className="text-4xl font-bold text-[#063B82]">{listing.title}</h1>
                    <span className="bg-[#FFD400] text-[#063B82] px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      {transactionLabel} · {listingKindLabel}
                    </span>
                  </div>

                  <p className="text-[#FFD400] font-semibold mb-6 flex items-center text-lg">
                    <i className="ri-map-pin-line mr-2"></i>
                    {listing.location}
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed mb-8">{listing.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold text-[#063B82] mb-4">Features</h3>
                      <ul className="space-y-2">
                        {(listing.features ?? []).map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <i className="ri-check-line text-[#FFD400] mr-3"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-[#063B82] mb-6">Pricing</h3>
                  {pricingRows.length ? (
                    <div className="space-y-3">
                      {pricingRows.map((row, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-[#F3F5F8] rounded-lg">
                          <span className="text-gray-700">{row.label}</span>
                          <span className="font-semibold text-[#063B82]">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-700 bg-[#F3F5F8] border border-gray-100 rounded-lg p-4 overflow-auto">
                      {JSON.stringify(listing.pricing ?? {}, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24">
                  <h3 className="text-2xl font-bold text-[#063B82] mb-6">Interested?</h3>
                  <div className="mt-2 space-y-4">
                    <Link
                      href="/contact"
                      className="w-full bg-[#FFD400] text-white px-6 py-4 rounded-lg hover:bg-[#e6bf00] transition-colors cursor-pointer text-center block whitespace-nowrap"
                    >
                      {listing.transaction_type === 'sale' ? 'Contact for Purchase' : 'Contact for Viewing'}
                    </Link>
                    <Link
                      href="/contact"
                      className="w-full border-2 border-[#FFD400] text-[#FFD400] px-6 py-4 rounded-lg hover:bg-[#FFD400] hover:text-white transition-colors cursor-pointer text-center block whitespace-nowrap"
                    >
                      {listing.transaction_type === 'sale' ? 'Schedule Site Visit' : 'Request Lease Details'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}