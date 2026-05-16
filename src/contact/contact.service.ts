import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  constructor(private readonly configService: ConfigService) {}

  async sendContactEmail(values: { name: string; email: string; subject: string; message: string }) {
    const ownerEmail = this.configService.get<string>('EMAIL');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: white !important; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-box { background: #f8fafc; border-radius: 15px; padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
          .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; display: block; }
          .value { color: #1e293b; font-size: 16px; margin-bottom: 15px; display: block; }
          .message-content { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; font-style: italic; color: #334155; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 20px; color: white;">MESAZH I RI KONTAKTI</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <span class="label">Nga:</span>
              <span class="value">${values.name} (${values.email})</span>
              
              <span class="label">Subjekti:</span>
              <span class="value">${values.subject}</span>
              
              <span class="label">Mesazhi:</span>
              <div class="message-content">"${values.message}"</div>
            </div>
          </div>
          <div class="footer">
            <p>Kjo është një dërgesë automatike nga forma e kontaktit në Lemea Fragrance.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resendKey = this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Lemea Contact <onboarding@resend.dev>',
          to: ownerEmail,
          reply_to: values.email,
          subject: `📧 Mesazh i Ri: ${values.subject}`,
          html: emailHtml
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      console.log('Contact email sent successfully via Resend');
      return true;
    } catch (error) {
      console.error('Failed to send contact email via Resend:', error.message);
      throw error;
    }
  }
}
