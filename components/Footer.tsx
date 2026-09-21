'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0e3d5f] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/images/logo.svg" 
              alt="Regcos Christian Academy" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-300 mb-4">
              A Christ-centered institution nurturing hearts, minds, and futures through quality education and strong Christian values.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#ffd96a] hover:text-white transition-colors cursor-pointer">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#ffd96a] hover:text-white transition-colors cursor-pointer">
                <i className="ri-twitter-x-fill text-xl"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#ffd96a] hover:text-white transition-colors cursor-pointer">
                <i className="ri-youtube-fill text-xl"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#ffd96a] hover:text-white transition-colors cursor-pointer">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Calendar
                </Link>
              </li>
              <li>
                <Link href="/construction" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Our Programs</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Great Teachers
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Music Program
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Sports Training
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-[#ffd96a] transition-colors cursor-pointer">
                  Skills Recognition
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start space-x-2">
                <i className="ri-map-pin-line text-[#ffd96a] mt-1"></i>
                <span>Stand No. 12305, Woodlands</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-phone-line text-[#ffd96a]"></i>
                <span>+260 975 141 977 | +260 978 900 184</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-mail-line text-[#ffd96a]"></i>
                <span>admin@regcoschristianacademy.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Regcos Christian Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}