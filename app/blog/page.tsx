'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarBlank, Tag, MagnifyingGlass, BookOpen } from 'phosphor-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const blogPosts = [
  {
    id: 1,
    slug: 'faith-and-learning',
    category: 'Faith & Values',
    title: 'Why Faith-Based Education Makes a Lasting Difference',
    excerpt: 'At Regcos Christian Academy, we believe that education rooted in Christian values doesn\'t just teach facts — it shapes character, builds empathy, and gives children a moral foundation that guides them for life.',
    date: 'September 15, 2026',
    author: 'The Regcos Team',
    image: 'https://readdy.ai/api/search-image?query=children+praying+together+in+school+chapel%2C+faith-based+education%2C+warm+spiritual+learning+environment%2C+golden+hour+lighting&width=800&height=500&seq=blog-001&orientation=landscape',
    readTime: '4 min read',
  },
  {
    id: 2,
    slug: 'academic-excellence',
    category: 'Academic Life',
    title: 'Building Strong Foundations: Our Approach to Early Literacy',
    excerpt: 'Research shows the first years of schooling are the most critical for literacy development. Discover how our dedicated teachers use proven, joyful methods to ignite a love of reading in every child.',
    date: 'September 10, 2026',
    author: 'Mrs. Chanda Mutale',
    image: 'https://readdy.ai/api/search-image?query=young+children+reading+books+in+bright+colorful+classroom%2C+teacher+reading+aloud%2C+happy+students%2C+warm+natural+light&width=800&height=500&seq=blog-002&orientation=landscape',
    readTime: '5 min read',
  },
  {
    id: 3,
    slug: 'sports-and-health',
    category: 'Sports & Wellbeing',
    title: 'Sports Day 2026: A Day of Joy, Teamwork, and School Spirit',
    excerpt: 'Our annual Sports Day was a tremendous success! Read our recap of the incredible athletic achievements, teamwork moments, and community spirit that made this year\'s event one to remember.',
    date: 'August 28, 2026',
    author: 'Coach Banda',
    image: 'https://readdy.ai/api/search-image?query=school+sports+day%2C+children+running+race+on+track%2C+cheering+crowd%2C+colorful+school+uniforms%2C+sunny+day%2C+joyful+atmosphere&width=800&height=500&seq=blog-003&orientation=landscape',
    readTime: '3 min read',
  },
  {
    id: 4,
    slug: 'music-arts',
    category: 'Arts & Creativity',
    title: 'The Power of Music: How Our Program Develops the Whole Child',
    excerpt: 'Music education goes far beyond learning an instrument. We explore how our music program at Regcos strengthens memory, discipline, emotional intelligence, and creative expression in our young learners.',
    date: 'August 20, 2026',
    author: 'Mr. Phiri',
    image: 'https://readdy.ai/api/search-image?query=children+playing+musical+instruments+in+school%2C+music+class%2C+choir%2C+happy+students+singing%2C+school+concert&width=800&height=500&seq=blog-004&orientation=landscape',
    readTime: '5 min read',
  },
  {
    id: 5,
    slug: 'parent-partnership',
    category: 'Community',
    title: 'Parent-Teacher Partnership: The Key to Every Child\'s Success',
    excerpt: 'A child flourishes when home and school work as one. Learn how Regcos Christian Academy fosters meaningful relationships with parents and what our community involvement initiatives look like in practice.',
    date: 'August 12, 2026',
    author: 'The Regcos Team',
    image: 'https://readdy.ai/api/search-image?query=parent+teacher+meeting+at+school%2C+warm+collaboration%2C+professional+friendly+classroom+setting%2C+family+education&width=800&height=500&seq=blog-005&orientation=landscape',
    readTime: '4 min read',
  },
  {
    id: 6,
    slug: 'enrollment-tips',
    category: 'Admissions',
    title: 'Is Regcos the Right School for Your Child? 5 Questions to Ask',
    excerpt: 'Choosing a school is one of the most important decisions a parent can make. We\'ve put together a helpful guide of key questions to consider when evaluating schools — and how Regcos measures up.',
    date: 'July 30, 2026',
    author: 'The Admissions Team',
    image: 'https://readdy.ai/api/search-image?query=happy+family+visiting+school%2C+parents+and+child+at+school+tour%2C+admissions%2C+modern+school+building%2C+friendly+staff&width=800&height=500&seq=blog-006&orientation=landscape',
    readTime: '6 min read',
  },
];

const categories = ['All', 'Faith & Values', 'Academic Life', 'Sports & Wellbeing', 'Arts & Creativity', 'Community', 'Admissions'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = blogPosts.filter((post) => {
    const matchCat = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero Banner */}
      <div className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full mix-blend-screen filter blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-gold font-bold text-xs uppercase tracking-[0.3em] mb-4">News & Insights</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">The Regcos Blog</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Stories, insights, and updates from our school community — celebrating learning, faith, and growth.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="py-20">
        <div className="container mx-auto px-4">

          {/* Search + Filter Bar */}
          <motion.div
            className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Search */}
            <div className="relative w-full md:max-w-sm">
              <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all text-sm"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                    activeCategory === cat
                      ? 'bg-navy text-gold shadow-md'
                      : 'bg-white text-navy border border-gray-200 hover:border-navy'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Post (first card, large) */}
          {filtered.length > 0 && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="relative overflow-hidden h-72 lg:h-auto">
                  <img
                    src={filtered[0].image}
                    alt={filtered[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy/40 to-transparent" />
                  <span className="absolute top-5 left-5 bg-gold text-navy px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                    {filtered[0].category}
                  </span>
                </div>
                <div className="flex flex-col justify-center p-10">
                  <div className="flex items-center gap-3 text-gray-400 text-xs mb-4">
                    <CalendarBlank size={14} />
                    <span>{filtered[0].date}</span>
                    <span>·</span>
                    <BookOpen size={14} />
                    <span>{filtered[0].readTime}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4 leading-snug">
                    {filtered[0].title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-8">{filtered[0].excerpt}</p>
                  <Link
                    href={`/blog/${filtered[0].slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy border-b-2 border-navy pb-0.5 hover:text-gold hover:border-gold transition-colors self-start group/link"
                  >
                    Read Full Story
                    <ArrowRight size={14} weight="bold" className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rest of Posts Grid */}
          {filtered.length > 1 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.slice(1).map((post, index) => (
                <motion.div
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                  viewport={{ once: true, margin: '-50px' }}
                >
                  <div className="relative overflow-hidden h-52">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                    <span className="absolute top-4 left-4 bg-gold text-navy px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-3 text-gray-400 text-xs mb-3">
                      <CalendarBlank size={13} />
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-3 leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy hover:text-gold transition-colors group/link"
                    >
                      Read More
                      <ArrowRight size={13} weight="bold" className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Results */}
          {filtered.length === 0 && (
            <div className="text-center py-24 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No posts found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
