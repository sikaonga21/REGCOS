import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admissions & Programs | Regcos Christian Academy',
  description: 'Learn more about our Christ-centered learning environment, academic programs, and school community at Regcos Christian Academy.',
  keywords: 'Regcos Christian Academy, school admissions, Christian academy Zambia, education programs, primary school, music program, sports training',
  openGraph: {
    title: 'Admissions & Programs | Regcos Christian Academy',
    description: 'A Christ-centered education focused on academic excellence, character, and confidence for every child.',
    url: 'https://regcoschristianacademy.com/listings',
    images: [
      {
        url: '/images/logoo.png',
        width: 1200,
        height: 1200,
        alt: 'Regcos Christian Academy logo',
        type: 'image/png',
      },
    ],
  },
  alternates: {
    canonical: '/listings',
  },
};

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 