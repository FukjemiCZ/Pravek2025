import { SmsProvider } from "@prisma/client";

export type SmsSendResult = {
  status: "SENT" | "FAILED";
  provider: SmsProvider;
  providerId?: string;
  error?: string;
};

export async function sendSms(phone: string, body: string): Promise<SmsSendResult> {
  const provider = (process.env.SMS_PROVIDER || "MOCK").toUpperCase() as SmsProvider;

  if (provider === "MOCK") {
    console.log("[MOCK SMS]", phone, body);
    return { status: "SENT", provider: "MOCK", providerId: `mock-${Date.now()}` };
  }

  if (provider === "BULKGATE") {
    const applicationId = process.env.BULKGATE_APPLICATION_ID;
    const applicationToken = process.env.BULKGATE_APPLICATION_TOKEN;
    const senderId = process.env.BULKGATE_SENDER_ID || "Pravek";

    if (!applicationId || !applicationToken) {
      return { status: "FAILED", provider: "BULKGATE", error: "Missing BulkGate credentials." };
    }

    const response = await fetch("https://portal.bulkgate.com/api/1.0/simple/transactional", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        application_id: applicationId,
        application_token: applicationToken,
        number: phone,
        text: body,
        sender_id: "gText",
        sender_id_value: senderId
      })
    });

    if (!response.ok) return { status: "FAILED", provider: "BULKGATE", error: await response.text() };

    const json = await response.json();
    return { status: "SENT", provider: "BULKGATE", providerId: String(json.sms_id || json.id || "") };
  }

  return { status: "FAILED", provider, error: `Unsupported SMS provider ${provider}` };
}
