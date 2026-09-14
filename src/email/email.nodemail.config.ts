import nodemailer from 'nodemailer';

export const sendEmailWithHostinger = async ({
  to,
  subject,
  text,
  htmlContent
}: {
  to: string;
  subject: string;
  text: string;
  htmlContent: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.HOSTINGER_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.HOSTINGER_EMAIL_USER,
        pass: process.env.HOSTINGER_EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.HOSTINGER_EMAIL_USER,
      to,
      subject,
      text,
      html: htmlContent
    });

    console.log('Email sent via Hostinger SMTP');
  } catch (error) {
    console.error('Hostinger email error ======>', error);
  }
};
