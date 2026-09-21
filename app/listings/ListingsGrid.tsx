
'use client';

import Link from 'next/link';
import { type ListingItem } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ArrowRight, MapPinLine } from 'phosphor-react';

const formatMaybeNumber = (v: unknown) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v.toLocaleString();
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n.toLocaleString();
  }
  return null;
};

const getPriceLabel = (listing: ListingItem) => {
  const pricing = (listing.pricing ?? {}) as Record<string, unknown>;

  if (listing.transaction_type === 'sale') {
    const cash = formatMaybeNumber(pricing.cash ?? pricing.cash_min ?? pricing.price_cash);
    if (cash) return `From K${cash}`;
    const min = formatMaybeNumber(pricing.cash_min ?? pricing.price_min);
    const max = formatMaybeNumber(pricing.cash_max ?? pricing.price_max);
    if (min && max) return `K${min} - K${max}`;
    return 'Pricing set';
  }

  const monthly = formatMaybeNumber(pricing.monthly ?? pricing.monthly_min ?? pricing.rent_monthly);
  if (monthly) return `K${monthly}/mo`;
  return 'Pricing set';
};

export default function ListingsGrid({ listings }: { listings: ListingItem[] }) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {listings.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 p-12 text-center text-gray-500">
            No listings match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing, idx) => {
              const badge = `${listing.transaction_type === 'sale' ? 'Sale' : 'Rent'} · ${
                listing.listing_kind === 'plot' ? 'Plot' : 'House'
              }`;

              const priceLabel = getPriceLabel(listing);

              return (
                <motion.div
                  key={listing.id}
                  className="bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.03, ease: 'easeOut' }}
                  viewport={{ once: true, margin: '-60px' }}
                >
                  <div className="relative">
                    {listing.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-48 object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#063B82] text-white px-3 py-1 text-sm font-semibold">
                      {badge}
                    </div>
                    <div className="absolute top-4 right-4 bg-[#FFD400] text-[#063B82] px-3 py-1 text-sm font-semibold">
                      {priceLabel}
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-[#063B82] mb-2">{listing.title}</h3>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPinLine size={16} weight="fill" className="text-[#063B82] mr-2" />
                      <span>{listing.location}</span>
                    </div>

                    {listing.features?.length ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {listing.features.slice(0, 4).map((feature, index) => (
                          <span
                            key={`${feature}-${index}`}
                            className="bg-[#F3F5F8] text-[#063B82] px-3 py-1 text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-4 text-sm text-gray-500">No features listed.</div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/listings/${listing.slug}`}
                        className="flex-1 bg-[#063B82] hover:bg-black text-white px-4 py-3 font-semibold transition-all duration-300 text-center cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2"
                      >
                        View Details
                        <ArrowRight size={14} weight="bold" />
                      </Link>
                      <Link
                        href="/contact"
                        className="border border-[#063B82] text-[#063B82] hover:bg-[#063B82] hover:text-white px-4 py-3 font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
