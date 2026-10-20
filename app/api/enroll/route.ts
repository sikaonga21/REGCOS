import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isDatabaseConfigured, sql } from '@/lib/db/client';
import { recordAudit } from '@/lib/auth/guard';
import { getSettings } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

const REQUIRED_FIELDS = [
  'childName', 'childDob', 'gender', 'residentialAddress',
  'fatherName', 'fatherOccupation', 'fatherWorkPlace', 'fatherPhone', 'fatherEmail', 'fatherNationality', 'fatherReligion',
  'motherName', 'motherOccupation', 'motherWorkPlace', 'motherPhone', 'motherEmail', 'motherNationality', 'motherReligion',
  'developmentalConcern', 'developmentalDetails',
];

const LABELS: Record<string, string> = {
  childName: "Child's name",
  childDob: 'Date of birth',
  gender: 'Gender',
  residentialAddress: 'Residential address',
  fatherName: "Father/Guardian's name",
  fatherOccupation: "Father/Guardian's occupation",
  fatherWorkPlace: "Father/Guardian's workplace",
  fatherPhone: "Father/Guardian's phone/WhatsApp",
  fatherEmail: "Father/Guardian's email",
  fatherNationality: "Father/Guardian's nationality",
  fatherReligion: "Father/Guardian's religion",
  motherName: "Mother/Guardian's name",
  motherOccupation: "Mother/Guardian's occupation",
  motherWorkPlace: "Mother/Guardian's workplace",
  motherPhone: "Mother/Guardian's phone/WhatsApp",
  motherEmail: "Mother/Guardian's email",
  motherNationality: "Mother/Guardian's nationality",
  motherReligion: "Mother/Guardian's religion",
  previousSchool: 'Attended another school',
  comfortableInGroups: 'Comfortable in group situations',
  hasSiblings: 'Has siblings',
  hasPet: 'Has a pet',
  specialDiet: 'Special diet',
  hasAllergies: 'Has allergies',
  allergyDetails: 'Allergy details',
  usesDiapers: 'Uses diapers',
  usesPotty: 'Uses a potty or toilet',
  toiletReminders: 'Needs toilet reminders',
  developmentalConcern: 'Developmental concern',
  developmentalDetails: 'Developmental details',
  dayToDayCare: 'Day-to-day care at home',
  homeLanguage: 'Language spoken at home',
  expectedStartDate: 'Expected start date',
};

const escapeHtml = (value: unknown) =>
  String(value ?? 'Not provided')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>');

/** Best-effort notification. A failed send must not lose a stored application. */
async function notifyAdmin(body: Record<string, unknown>, to: string): Promise<void> {
  if (!process.env.RESEND_API_KEY || !to) return;

  const detailsRows = Object.entries(body)
    .filter(([key]) => LABELS[key])
    .map(
      ([key, value]) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${LABELS[key]}:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(value)}</td>
          </tr>`
    )
    .join('');

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h2 style="color: #063B82; border-bottom: 3px solid #FFD400; padding-bottom: 10px;">New Student Enrollment Registration</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${detailsRows}
        </table>
        <div style="margin-top: 32px; font-size: 12px; color: #6b7280; text-align: center;">
          <p>Sent from the Regcos Christian Academy website. Review it in the admin panel under Enrollments.</p>
        </div>
      </div>
    `;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: 'Regcos Website <onboarding@resend.dev>',
    to: [to],
    subject: `New Enrollment Registration: ${String(body.childName ?? 'Applicant')}`,
    html,
    replyTo: String(body.fatherEmail || body.motherEmail || ''),
  });

  if (error) console.error('Resend API error:', error);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (REQUIRED_FIELDS.some((field) => !body[field])) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const childName = String(body.childName).trim();
  let stored = false;

  if (isDatabaseConfigured) {
    try {
      await sql`
        insert into enrollments (
          child_name, child_dob, gender, guardian_name, email, phone, start_date, payload
        ) values (
          ${childName},
          ${String(body.childDob ?? '')},
          ${String(body.gender ?? '')},
          ${String(body.fatherName || body.motherName || '')},
          ${String(body.fatherEmail || body.motherEmail || '')},
          ${String(body.fatherPhone || body.motherPhone || '')},
          ${String(body.expectedStartDate ?? '')},
          ${JSON.stringify(body)}::jsonb
        )
      `;
      stored = true;
      await recordAudit(null, 'received enrollment application', 'enrollments', '', childName);
    } catch (error) {
      console.error('Storing enrollment failed:', error);
    }
  }

  // Notification address is configurable from the admin Settings page.
  let notifyTo = process.env.ADMIN_EMAIL || '';
  try {
    const settings = await getSettings();
    notifyTo = settings.admin_notification_email || notifyTo || settings.email;
  } catch {
    // Settings are optional; fall back to the environment variable.
  }

  try {
    await notifyAdmin(body, notifyTo);
  } catch (error) {
    console.error('Enrollment notification failed:', error);
  }

  if (!stored && !process.env.RESEND_API_KEY) {
    // Nothing was persisted and nothing was emailed — say so rather than
    // telling the parent their application was received.
    console.warn('Enrollment could not be stored or emailed. Configure POSTGRES_URL or RESEND_API_KEY.');
    return NextResponse.json(
      {
        error:
          'We could not submit your registration right now. Please call or WhatsApp us so we can take your details.',
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ message: 'Registration submitted successfully', stored });
}
