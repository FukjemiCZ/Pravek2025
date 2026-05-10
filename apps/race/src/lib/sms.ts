import { SmsProvider } from "@prisma/client";

export async function sendSms(phone: string, body: string): Promise<{ provider: SmsProvider; status: string; providerId?: string; error?: string }> {
  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase();
  if (provider !== "bulkgate") {
    console.log(`[MOCK SMS] ${phone}: ${body}`);
    return { provider: "MOCK", status: "SENT", providerId: `mock-${Date.now()}` };
  }

  const applicationId = process.env.BULKGATE_APPLICATION_ID;
  const applicationToken = process.env.BULKGATE_APPLICATION_TOKEN;
  const senderId = process.env.BULKGATE_SENDER_ID || "Pravek";
  if (!applicationId || !applicationToken) return { provider: "BULKGATE", status: "FAILED", error: "Missing BulkGate credentials." };

  const response = await fetch("https://portal.bulkgate.com/api/1.0/simple/transactional", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ application_id: applicationId, application_token: applicationToken, number: phone, text: body, sender_id: senderId, sender_id_value: senderId })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { provider: "BULKGATE", status: "FAILED", error: JSON.stringify(payload) };
  return { provider: "BULKGATE", status: "SENT", providerId: String(payload.sms_id || payload.id || "") };
}
