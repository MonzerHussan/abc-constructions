import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";

export type VerificationChannel = "email" | "phone";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const SEND_LIMIT = 5;
const SEND_WINDOW_MS = 60 * 60 * 1000;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${local.length > 2 ? "***" : "*"}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return phone;
  return `${phone.slice(0, Math.max(0, phone.length - 4)).replace(/\d/g, "*")}${digits.slice(-4)}`;
}

export async function getContactVerificationStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true, emailVerified: true, phoneVerified: true },
  });
  if (!user) return null;

  return {
    email: user.email,
    phone: user.phone,
    emailVerified: user.emailVerified != null,
    phoneVerified: user.phoneVerified != null,
    emailMasked: maskEmail(user.email),
    phoneMasked: user.phone ? maskPhone(user.phone) : null,
    canUploadVerificationDocs:
      user.emailVerified != null && user.phoneVerified != null,
  };
}

export async function isContactVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, phoneVerified: true },
  });
  return user?.emailVerified != null && user?.phoneVerified != null;
}

async function invalidateActiveCodes(userId: string, channel: VerificationChannel) {
  await prisma.contactVerificationCode.updateMany({
    where: { userId, channel, usedAt: null, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  });
}

export async function sendContactVerificationCode(
  userId: string,
  channel: VerificationChannel,
): Promise<{ ok: true; devCode?: string } | { ok: false; error: string; status?: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true, emailVerified: true, phoneVerified: true, name: true },
  });
  if (!user) return { ok: false, error: "User not found", status: 404 };

  if (channel === "email") {
    if (user.emailVerified) return { ok: false, error: "Email already verified", status: 409 };
  } else {
    if (user.phoneVerified) return { ok: false, error: "Phone already verified", status: 409 };
    if (!user.phone?.trim()) {
      return { ok: false, error: "No phone number on file", status: 422 };
    }
  }

  const target = channel === "email" ? user.email.trim().toLowerCase() : user.phone!.trim();
  const code = generateCode();
  const codeHash = hashCode(code);

  await invalidateActiveCodes(userId, channel);
  await prisma.contactVerificationCode.create({
    data: {
      userId,
      channel,
      target,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  if (channel === "email") {
    const result = await sendVerificationCodeEmail({
      to: user.email,
      name: user.name,
      code,
    });
    if (!result.ok) {
      return { ok: false, error: result.error ?? "Failed to send email", status: 502 };
    }
    return { ok: true, devCode: process.env.NODE_ENV === "development" ? code : undefined };
  }

  const smsBody = `ABC Constructions: your verification code is ${code}. Valid for 10 minutes.`;
  const smsResult = await sendSms({ to: user.phone!, body: smsBody });
  if (!smsResult.ok) {
    return { ok: false, error: smsResult.error ?? "Failed to send SMS", status: 502 };
  }

  const devCode =
    process.env.NODE_ENV === "development" || smsResult.devMode ? code : undefined;
  return { ok: true, devCode };
}

export async function confirmContactVerificationCode(
  userId: string,
  channel: VerificationChannel,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const normalized = code.replace(/\D/g, "").trim();
  if (normalized.length !== 6) {
    return { ok: false, error: "Invalid code format", status: 422 };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, phoneVerified: true },
  });
  if (!user) return { ok: false, error: "User not found", status: 404 };

  if (channel === "email" && user.emailVerified) return { ok: true };
  if (channel === "phone" && user.phoneVerified) return { ok: true };

  const record = await prisma.contactVerificationCode.findFirst({
    where: {
      userId,
      channel,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { ok: false, error: "No active code. Request a new one.", status: 404 };
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Request a new code.", status: 429 };
  }

  const matches = record.codeHash === hashCode(normalized);
  await prisma.contactVerificationCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  if (!matches) {
    return { ok: false, error: "Invalid verification code", status: 422 };
  }

  await prisma.contactVerificationCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  if (channel === "email") {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: new Date() },
    });
  }

  return { ok: true };
}

export function contactVerificationRateLimitKey(userId: string, channel: VerificationChannel) {
  return `contact-verify-send:${userId}:${channel}`;
}

export { SEND_LIMIT, SEND_WINDOW_MS };
