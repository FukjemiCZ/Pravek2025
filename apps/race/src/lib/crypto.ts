import crypto from "node:crypto";

export function createPublicAccessToken() {
  return crypto.randomBytes(18).toString("base64url");
}

export function normalizeEmail(value?: string | null) {
  const email = (value || "").trim().toLowerCase();
  return email || null;
}

export function normalizePhone(value?: string | null) {
  const phone = (value || "").replace(/\s+/g, "").trim();
  return phone || null;
}

export function normalizeQrToken(input: string) {
  const value = input.trim();
  if (value.includes("/r/")) {
    return value.split("/r/")[1]?.split("?")[0]?.split("#")[0] || value;
  }
  return value;
}
