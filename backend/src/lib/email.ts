import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendTechnologistApprovalEmail(params: {
  to: string;
  name: string;
  approved: boolean;
  rejectionReason?: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[email] SMTP not configured — skipping notification to",
      params.to,
    );
    return;
  }

  const from =
    process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@eatwell.local";
  const subject = params.approved
    ? "Eatwell+ — Таны хүнсний технологичийн бүртгэл батлагдлаа"
    : "Eatwell+ — Хүнсний технологичийн бүртгэлийн хүсэлт";

  const text = params.approved
    ? `Сайн байна уу, ${params.name}!\n\nТаны хүнсний технологичийн бүртгэл админаар батлагдлаа. Одоо technologist нэвтрэх хуудаснаас нэвтэрч жор нэмж, засварлаж болно.\n\nEatwell+ баг`
    : `Сайн байна уу, ${params.name}!\n\nУучлаарай, таны хүнсний технологичийн бүртгэлийн хүсэлтийг админ зөвшөөрөөгүй.${params.rejectionReason ? `\n\nШалтгаан: ${params.rejectionReason}` : ""}\n\nШинээр баталгаажуулах баримт илгээж дахин бүртгүүлэх боломжтой.\n\nEatwell+ баг`;

  await transporter.sendMail({ from, to: params.to, subject, text });
}

export async function sendPasswordResetOtpEmail(params: {
  to: string;
  name: string;
  code: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[email] SMTP not configured — skipping password reset OTP to",
      params.to,
    );
    return;
  }

  const from =
    process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@eatwell.local";
  const subject = "Eatwell+ — Нууц үг сэргээх код";
  const text = `Сайн байна уу${params.name ? `, ${params.name}` : ""}!

Нууц үг сэргээх код: ${params.code}

Энэ код 10 минутын дотор хүчинтэй. Хэрэв та нууц үг сэргээх хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.

Eatwell+`;

  await transporter.sendMail({ from, to: params.to, subject, text });
}
