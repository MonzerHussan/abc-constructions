export interface ContactVerificationStatus {
  email: string;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  emailMasked: string;
  phoneMasked: string | null;
  canUploadVerificationDocs: boolean;
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  const json = (await res.json()) as {
    success?: boolean;
    data?: T;
    error?: { message?: string };
    message?: string;
  };
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message ?? json.message ?? "Request failed");
  }
  return json.data as T;
}

export async function fetchContactVerificationStatus(): Promise<ContactVerificationStatus> {
  const res = await fetch("/api/v1/contact-verification/status", {
    cache: "no-store",
    credentials: "include",
  });
  return parseEnvelope<ContactVerificationStatus>(res);
}

export async function sendEmailCode(): Promise<{ devCode?: string }> {
  const res = await fetch("/api/v1/contact-verification/email/send", {
    method: "POST",
    credentials: "include",
  });
  return parseEnvelope<{ message: string; devCode?: string }>(res);
}

export async function confirmEmailCode(code: string): Promise<void> {
  const res = await fetch("/api/v1/contact-verification/email/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  await parseEnvelope(res);
}

export async function sendPhoneCode(): Promise<{ devCode?: string }> {
  const res = await fetch("/api/v1/contact-verification/phone/send", {
    method: "POST",
    credentials: "include",
  });
  return parseEnvelope<{ message: string; devCode?: string }>(res);
}

export async function confirmPhoneCode(code: string): Promise<void> {
  const res = await fetch("/api/v1/contact-verification/phone/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });
  await parseEnvelope(res);
}
