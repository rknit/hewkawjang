import {
  eq,
} from 'drizzle-orm';
import nodemailer from "nodemailer";
import { db } from '../db';
import { emailVerificationTable ,usersTable } from '../db/schema';
import createHttpError from 'http-errors';

export default class MailerService {
  static async sendVerifiedEmail(email: string, OTP: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, 
      subject: "Email Verification",
      html: `<p>This is your OTP: ${OTP}</p>`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent:", info.response);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  }

  static async sendOTP(email: string): Promise<void> {
    let dup = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    if (dup.length > 0) {
      throw createHttpError.Conflict('Email already exists');
    }
    const otp = await this.generateOTP();
    await this.sendVerifiedEmail(email, otp);
    let timestamp = new Date(Date.now());
    let data = {"email":email,"otp":otp,"sendTime":timestamp}
    await db.insert(emailVerificationTable).values(data);
  }

  static async generateOTP(length = 6) {
    return (Math.floor(100000 + Math.random() * 900000 + Math.random())%1000000).toString(); // 6 หลัก
  }
}