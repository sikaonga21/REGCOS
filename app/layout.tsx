import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Regcos Christian Academy',
  description: 'Regcos Christian Academy is a Christ-centered institution dedicated to nurturing hearts, minds, and futures through quality education, strong Christian values, and a joyful learning environment.',
  keywords: 'Regcos Christian Academy, Christian school, preschool, early learning, education Zambia, Woodlands school, primary school',
  authors: [{ name: 'Regcos Christian Academy' }],
  creator: 'Regcos Christian Academy',
  publisher: 'Regcos Christian Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://regcoschristianacademy.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Regcos Christian Academy',
    description: 'A Christ-centered institution dedicated to nurturing hearts, minds, and futures through quality education and strong Christian values.',
    url: 'https://regcoschristianacademy.com',
    siteName: 'Regcos Christian Academy',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 1200,
        alt: 'Regcos Christian Academy',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regcos Christian Academy',
    description: 'A Christ-centered institution dedicated to nurturing hearts, minds, and futures through quality education and strong Christian values.',
    images: ['/images/logo.png'],
    creator: '@regcosacademy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Education',
  classification: 'School',
  referrer: 'origin-when-cross-origin',
  other: {
    'geo.region': 'ZM',
    'geo.placename': 'Woodlands, Zambia',
    'geo.position': '-15.4566;28.3553',
    'ICBM': '-15.4566, 28.3553',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "School",
              "name": "Regcos Christian Academy",
              "description": "A Christ-centered institution dedicated to nurturing hearts, minds, and futures through quality education and strong Christian values.",
              "url": "https://regcoschristianacademy.com",
              "telephone": "+260 975 141 977",
              "email": "admin@regcoschristianacademy.com",
              "logo": "https://regcoschristianacademy.com/images/logo.png",
              "image": "https://regcoschristianacademy.com/images/logo.png",
              "address": [
                {
                  "@type": "PostalAddress",
                  "streetAddress": "Stand No. 12305",
                  "addressLocality": "Woodlands",
                  "addressRegion": "Lusaka",
                  "addressCountry": "ZM",
                  "postalCode": "10101"
                }
              ],
              "areaServed": "Zambia",
              "sameAs": [
                "https://facebook.com",
                "https://twitter.com",
                "https://youtube.com"
              ],
              "keywords": ["Christian school", "early learning", "education", "Zambia"]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
