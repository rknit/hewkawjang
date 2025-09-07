import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export async function sendVerifiedEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const url = `http://localhost:3000/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,

    subject: 'Verify Your Email for Hewkawjang',
    html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2>Welcome to Hewkawjang!</h2>
                <p>Please click the button below to verify your email address and complete your registration.</p>
                <a href="${url}" style="background-color: #4F46E5; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
                    Verify My Account
                </a>
                <p style="margin-top: 20px;">This link will expire in 15 minutes.</p>
                <p>If you did not sign up for an account, you can safely ignore this email.</p>
            </div>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

export function generateVerificationToken(userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '3m',
  });
  return token;
}
