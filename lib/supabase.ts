import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export type CareerItem = {
  id?: string | number;
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string[];
  active?: boolean;
  created_at?: string;
};

export type ListingItem = {
  id?: string | number;
  slug?: string;
  title?: string;
  location?: string;
  listing_kind?: 'plot' | 'house';
  transaction_type?: 'sale' | 'rent';
  description?: string;
  features?: string[];
  pricing?: Record<string, unknown> | null;
  image_url?: string | null;
  gallery_urls?: string[];
  active?: boolean;
  published?: boolean;
  sort_order?: number;
  created_at?: string;
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
