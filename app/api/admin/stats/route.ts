import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/guard';
import { getDashboardStats } from '@/lib/db/stats';
import { isBlobConfigured } from '@/lib/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ data: stats, blobConnected: isBlobConfigured });
  } catch (error) {
    console.error('Load dashboard stats failed:', error);
    return NextResponse.json(
      { error: 'Unable to load dashboard statistics. Has "npm run db:setup" been run?' },
      { status: 500 }
    );
  }
}
