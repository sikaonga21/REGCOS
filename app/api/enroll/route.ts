import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key from env, or a dummy if not set
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@regcos.edu';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = [
      'childName', 'childDob', 'gender', 'residentialAddress',
      'fatherName', 'fatherOccupation', 'fatherWorkPlace', 'fatherPhone', 'fatherEmail', 'fatherNationality', 'fatherReligion',
      'motherName', 'motherOccupation', 'motherWorkPlace', 'motherPhone', 'motherEmail', 'motherNationality', 'motherReligion',
      'developmentalConcern', 'developmentalDetails',
    ];

    if (requiredFields.some((field) => !body[field])) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Email sending simulated.');
      // Simulate successful sending for development if key is missing
      return NextResponse.json(
        { message: 'Registration received successfully (simulated).' },
        { status: 200 }
      );
    }

    const labels: Record<string, string> = {
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
    const escapeHtml = (value: unknown) => String(value ?? 'Not provided')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br/>');
    const detailsRows = Object.entries(body)
      .filter(([key]) => labels[key])
      .map(([key, value]) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${labels[key]}:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(value)}</td>
          </tr>`)
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0a192f; border-bottom: 2px solid #f7b733; padding-bottom: 10px;">New Student Enrollment Registration</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${detailsRows}
        </table>

        <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
          <p>This automated email was sent from the Regcos Christian Academy website.</p>
        </div>
      </div>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Regcos Website <onboarding@resend.dev>', // Use a verified domain in production
      to: [ADMIN_EMAIL],
      subject: `New Enrollment Registration: ${body.childName}`,
      html: htmlContent,
      replyTo: body.fatherEmail
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send registration email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Registration submitted successfully', id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Enroll API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
