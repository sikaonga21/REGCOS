import { recordAudit } from '@/lib/auth/guard';
import { isDatabaseConfigured, sql } from '@/lib/db/client';

type ContactSubmissionInput = Record<string, unknown>;

export type ContactSubmissionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; status: 400 | 503 | 500 };

function getText(input: ContactSubmissionInput, key: string): string {
  const value = input[key];
  return typeof value === 'string' ? value.trim() : '';
}

export async function saveContactSubmission(
  input: ContactSubmissionInput
): Promise<ContactSubmissionResult> {
  const name = getText(input, 'name');
  const email = getText(input, 'email');
  const message = getText(input, 'message');

  if (!name || !email || !message) {
    return { ok: false, message: 'Name, email, and message are required.', status: 400 };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Please enter a valid email address.', status: 400 };
  }
  if (message.length > 500) {
    return { ok: false, message: 'Message must be 500 characters or less.', status: 400 };
  }

  if (!isDatabaseConfigured) {
    console.warn('Contact message dropped — no database connected:', { name, email });
    return {
      ok: false,
      message:
        'We could not send your message right now. Please call or WhatsApp us instead and we will respond straight away.',
      status: 503,
    };
  }

  const details = [
    getText(input, 'program') && `Programme: ${getText(input, 'program')}`,
    getText(input, 'childAge') && `Child's age: ${getText(input, 'childAge')}`,
  ]
    .filter(Boolean)
    .join(' · ');
  const subject = [getText(input, 'subject') || 'Website enquiry', details]
    .filter(Boolean)
    .join(' — ');

  try {
    await sql`
      insert into contact_messages (name, email, phone, subject, message)
      values (${name}, ${email}, ${getText(input, 'phone')}, ${subject}, ${message})
    `;
    await recordAudit(null, 'received contact message', 'contact_messages', '', email);
    return { ok: true, message: 'Thank you for your message! We will get back to you soon.' };
  } catch (error) {
    console.error('Storing contact message failed:', error);
    return {
      ok: false,
      message: 'We could not send your message right now. Please call or WhatsApp us instead.',
      status: 500,
    };
  }
}