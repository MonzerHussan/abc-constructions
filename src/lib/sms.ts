interface SendSmsOpts {
  to: string;
  body: string;
}

export async function sendSms(
  opts: SendSmsOpts,
): Promise<{ ok: boolean; error?: string; devMode?: boolean }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (accountSid && authToken && from) {
    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const params = new URLSearchParams({
        To: opts.to,
        From: from,
        Body: opts.body,
      });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Twilio SMS error:", text);
        return { ok: false, error: "Failed to send SMS" };
      }
      return { ok: true };
    } catch (err) {
      console.error("Twilio SMS exception:", err);
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.CONTACT_VERIFICATION_SMS_DEV === "true"
  ) {
    console.log(`[DEV SMS] To: ${opts.to}\n${opts.body}`);
    return { ok: true, devMode: true };
  }

  return {
    ok: false,
    error: "SMS provider not configured (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)",
  };
}
