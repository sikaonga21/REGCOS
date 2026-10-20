import type { Metadata } from 'next';
import { ToastProvider } from '@/components/admin/ui';

export const metadata: Metadata = {
  title: 'Admin · Regcos Christian Academy',
  description: 'Content and admissions management for Regcos Christian Academy.',
  robots: { index: false, follow: false },
};

/**
 * Wraps both the login screen and the panel. The signed-in chrome lives in
 * app/admin/(panel)/layout.tsx so that /admin/login renders without a sidebar.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
