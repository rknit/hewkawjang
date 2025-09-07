import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function sendVerifiedEmail(email: string,token: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const url = `http://localhost:3000/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email, 
    subject: "Email Verification",
    html: `<p>Click <a href="${url}">here</a> to verify your account.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

export function generateVerificationToken(userId: string) {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "3m" } 
  );
  return token;
}

