const { Resend } = require('resend');

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Instantiate Resend inside the function so process.env is guaranteed to be loaded
    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'Royal Tailor <orders@royaltailors.net>',
      to: [to],
      subject: subject,
      html: html,
    });

    console.log('✅ Email sent via Resend ID:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error.message);
    return null;
  }
};

module.exports = sendEmail;