import nodemailer from 'nodemailer';

// Generate random 6-Digit OTP
export const generate6DigitOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const dispatchOTP = async ({ email, phone, otp, channel }) => {
  if (channel === 'email') {
    // Custom Domain SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., mail.royaltailors.net or smtp.zoho.in
      port: Number(process.env.SMTP_PORT) || 465, // 465 (SSL) or 587 (TLS)
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER, // e.g., orders@royaltailors.net
        pass: process.env.SMTP_PASS  // Email Account Password
      }
    });

    await transporter.sendMail({
      from: `"The Royal Tailor" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Access OTP - The Royal Tailor Patna',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #0f0f0f; color: #ffffff; border-radius: 12px; max-width: 500px; margin: 0 auto;">
          <h2 style="margin: 0 0 12px 0; letter-spacing: 1px;">THE ROYAL TAILOR</h2>
          <p style="color: #a1a1aa; font-size: 14px;">Your 6-digit login verification OTP code is:</p>
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; background: #18181b; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 16px 0; border: 1px solid #27272a;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #71717a;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
      `
    });
  } else if (channel === 'sms') {
    console.log(`[SMS GATEWAY] Sending OTP ${otp} to Mobile: ${phone}`);
  }
};