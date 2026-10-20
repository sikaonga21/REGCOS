import { NextResponse, type NextRequest } from 'next/server';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { getSettings, saveSettings } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    return NextResponse.json({ data: await getSettings() });
  } catch (error) {
    console.error('Load settings failed:', error);
    return NextResponse.json({ error: 'Unable to load settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin({ manage: true });
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const data = await saveSettings(body);
    await recordAudit(guard.admin, 'updated site settings', 'site_settings', '', Object.keys(body).join(', '));
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Save settings failed:', error);
    return NextResponse.json({ error: 'Unable to save settings.' }, { status: 500 });
  }
}
