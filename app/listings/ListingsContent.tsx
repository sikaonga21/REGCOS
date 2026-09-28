'use client';

import { useEffect, useState } from 'react';
import { supabase, type ListingItem } from '@/lib/supabase';
import ListingsGrid from './ListingsGrid';

const isMissingListingsTableError = (error: any) => {
  const message = error?.message || '';
  return message.includes('real_estate_listings') || message.includes('Could not find the table');
};

export default function ListingsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('real_estate_listings')
          .select('*')
          .eq('published', true)
          .eq('active', true)
          .order('sort_order', { ascending: true });

        if (fetchError) {
          if (isMissingListingsTableError(fetchError)) {
            setListings([]);
            setError(null);
            return;
          }
          throw fetchError;
        }
        setListings((data ?? []) as ListingItem[]);
      } catch (e: any) {
        if (isMissingListingsTableError(e)) {
          setListings([]);
          setError(null);
          return;
        }
        setError(e?.message ?? 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div>
      {error && <div className="container mx-auto px-4 py-4 text-red-700 bg-red-50 border border-red-200 rounded-xl mt-2">{error}</div>}

      {loading ? (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
                  <div className="h-40 bg-gray-100 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <ListingsGrid listings={listings} />
      )}
    </div>
  );
}