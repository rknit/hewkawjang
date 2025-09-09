import nodemailer from "nodemailer";


export async function sendVerifiedEmail(email: string,OTP: string) {
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

export function generateOTP(length = 6) {
  return (Math.floor(100000 + Math.random() * 900000 + Math.random())%1000000).toString(); // 6 หลัก
}
