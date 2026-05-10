import crypto from "node:crypto";

export function createPublicAccessToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function normalizeEmail(value?: string | null): string | null {
  const trimmed = value?.trim().toLowerCase();
  return trimmed || null;
}

export function normalizePhone(value?: string | null): string | null {
  const trimmed = value?.replace(/\s+/g, "").replace(/^00/, "+").trim();
  return trimmed || null;
}
