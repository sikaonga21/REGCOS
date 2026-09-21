
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'phosphor-react';

/* Two-line hamburger that morphs into an X */
const MenuIcon = ({ open }: { open: boolean }) => (
  <div className="w-6 h-4 flex flex-col justify-between relative" aria-hidden="true">
    <motion.span
      className="block h-[2px] bg-current rounded-full origin-center"
      animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    />
    <motion.span
      className="block h-[2px] bg-current rounded-full origin-center"
      animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    />
  </div>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const transparentMode = isHome && !scrolled;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menu on route change */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Our Philosophy', href: '/services' },
    { name: 'Calendar', href: '/listings' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        transparentMode ? 'bg-transparent shadow-none' : 'bg-white/90 backdrop-blur-md shadow-sm border-b border-navy/5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${
            transparentMode ? 'h-24' : 'h-20'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/images/logo.png"
              alt="Regcos Christian Academy"
              className={`w-auto transition-all duration-300 ${
                transparentMode ? 'h-20' : 'h-16'
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                    transparentMode
                      ? 'text-white hover:text-gold'
                      : 'text-navy hover:text-gold-hover'
                  }`}
                >
                  {item.name}
                </Link>
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full ${
                    transparentMode ? 'bg-gold' : 'bg-navy'
                  }`}
                />
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link
              href="/enroll"
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-sm hover:scale-105 hover:shadow-lg ${
                transparentMode
                  ? 'bg-gold hover:bg-gold-hover text-navy shadow-gold/20'
                  : 'bg-navy hover:bg-navy-light text-white shadow-navy/20'
              }`}
            >
              Enroll Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 transition-colors ${
              transparentMode ? 'text-white' : 'text-navy'
            }`}
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <MenuIcon open={isMenuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile menu - dark navy, slides down */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden glass-dark overflow-hidden"
          >
            <nav className="container mx-auto px-6 pt-2 pb-6 flex flex-col">
              {navigation.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between py-4 text-base font-medium tracking-wide border-b border-white/10 last:border-0 transition-colors ${
                      pathname === item.href
                        ? 'text-gold'
                        : 'text-white hover:text-gold'
                    }`}
                  >
                    {item.name}
                    <ArrowRight size={14} weight="bold" className="opacity-40" />
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navigation.length * 0.04 + 0.05, duration: 0.25 }}
                className="mt-5"
              >
                <Link
                  href="/enroll"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full bg-gold hover:bg-gold-hover text-navy py-4 font-bold text-center uppercase tracking-wider text-sm transition-colors rounded-sm"
                >
                  Enroll Now
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
