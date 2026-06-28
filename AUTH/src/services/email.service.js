import nodemailer from "nodemailer";
import config from "../config/config.js";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.GOOGLE_USER,
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken: config.GOOGLE_REFRESH_TOKEN,
    accessToken: config.GOOGLE_ACCESS_TOKEN // optional if you generate it
  }
});


// Verify email server connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error connecting to email server:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});


// Send email function
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your App" <${config.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log("✅ Email sent successfully");
    console.log("Message ID:", info.messageId);

    return info;

  } catch (error) {
    console.error("❌ Error sending email:", error.message);

    // Let controller handle the error
    throw new Error("Failed to send email");
  }
};