'use server';

import { saveContactSubmission } from '@/lib/contact-submission';

export type ContactActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function submitContactAction(
  _previousState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const result = await saveContactSubmission({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    program: formData.get('program'),
    childAge: formData.get('childAge'),
    message: formData.get('message'),
  });

  return result.ok
    ? { status: 'success', message: result.message }
    : { status: 'error', message: result.message };
}