import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key from env, or a dummy if not set
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@regcos.edu';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      parentName, 
      parentEmail, 
      parentPhone, 
      childName, 
      childDob, 
      program, 
      previousSchool, 
      specialNeeds 
    } = body;

    // Validate required fields
    if (!parentName || !parentEmail || !parentPhone || !childName || !childDob || !program) {
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

    // Construct the email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0a192f; border-bottom: 2px solid #f7b733; padding-bottom: 10px;">New Student Enrollment Registration</h2>
        
        <h3 style="color: #0a192f; margin-top: 20px;">Parent/Guardian Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${parentName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${parentEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${parentPhone}</td>
          </tr>
        </table>

        <h3 style="color: #0a192f; margin-top: 20px;">Student Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Child's Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${childName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date of Birth:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${childDob}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Program Applying For:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${program}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Previous School:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${previousSchool || 'N/A'}</td>
          </tr>
        </table>

        <h3 style="color: #0a192f; margin-top: 20px;">Additional Information</h3>
        <p style="padding: 12px; background-color: #f9f9f9; border-left: 4px solid #f7b733; margin-top: 10px;">
          ${specialNeeds ? specialNeeds.replace(/\n/g, '<br/>') : 'None specified.'}
        </p>

        <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
          <p>This automated email was sent from the Regcos Christian Academy website.</p>
        </div>
      </div>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Regcos Website <onboarding@resend.dev>', // Use a verified domain in production
      to: [ADMIN_EMAIL],
      subject: `New Enrollment Registration: ${childName} for ${program}`,
      html: htmlContent,
      reply_to: parentEmail
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
