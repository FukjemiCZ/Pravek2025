import { google } from "googleapis";
import { normalizeEmail, normalizePhone } from "./crypto";

export type ImportFilters = {
  year: number;
  paid?: "all" | "yes" | "no";
  confirmed?: "all" | "yes" | "no";
};

export type SheetRacerCandidate = {
  sourceRow: number;
  sourceKey: string;
  year: number;
  startNumber?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  routeName?: string | null;
  paid: boolean;
  confirmed: boolean;
  raw: Record<string, string>;
};

function truthy(value?: string | null): boolean {
  const v = (value || "").trim().toLowerCase();
  return ["true", "1", "ano", "yes", "y", "zaplaceno", "potvrzeno"].includes(v);
}

function pick(row: Record<string, string>, names: string[]): string | undefined {
  for (const name of names) {
    const value = row[name.toLowerCase()];
    if (value !== undefined && value !== "") return value;
  }
  return undefined;
}

export async function loadRacerCandidates(filters: ImportFilters): Promise<SheetRacerCandidate[]> {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = process.env.SHEET_NAME_RACERS || "Registrace";
  if (!serviceAccountKey || !spreadsheetId) throw new Error("Missing Google Sheets configuration.");

  const credentials = JSON.parse(serviceAccountKey);
  const auth = new google.auth.JWT(credentials.client_email, undefined, credentials.private_key, ["https://www.googleapis.com/auth/spreadsheets.readonly"]);
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: sheetName });
  const rows = response.data.values || [];
  if (rows.length < 2) return [];

  const [header, ...dataRows] = rows;
  const keys = header.map((cell) => String(cell || "").trim().toLowerCase());

  return dataRows.map((cells, idx) => {
    const raw: Record<string, string> = {};
    keys.forEach((key, i) => (raw[key] = String(cells[i] || "").trim()));

    const fullName = pick(raw, ["name", "jmeno", "jméno", "full_name", "cele_jmeno", "celé jméno"]);
    const firstName = pick(raw, ["firstName", "first_name", "jmeno", "jméno", "krestni", "křestní"]) || fullName?.split(" ").slice(0, -1).join(" ") || fullName || "Neznámé";
    const lastName = pick(raw, ["lastName", "last_name", "prijmeni", "příjmení"]) || fullName?.split(" ").slice(-1).join(" ") || "";
    const year = Number(pick(raw, ["rocnik", "ročník", "year"]) || filters.year);
    const email = normalizeEmail(pick(raw, ["email", "e-mail", "mail"]));
    const phone = normalizePhone(pick(raw, ["phone", "telefon", "mobile", "mobil"]));
    const paid = truthy(pick(raw, ["paid", "zaplaceno", "payment", "platba"]));
    const confirmed = truthy(pick(raw, ["confirmed", "potvrzeno", "confirmation", "potvrzeni", "potvrzení"]));

    return {
      sourceRow: idx + 2,
      sourceKey: `${year}:${email || ""}:${phone || ""}:${idx + 2}`,
      year,
      startNumber: pick(raw, ["startNumber", "start_number", "startovni_cislo", "startovní číslo", "cislo", "číslo"]) || null,
      firstName,
      lastName,
      email,
      phone,
      routeName: pick(raw, ["route", "trasa", "distance", "vzdalenost"]),
      paid,
      confirmed,
      raw
    };
  }).filter((candidate) => {
    if (candidate.year !== filters.year) return false;
    if (filters.paid === "yes" && !candidate.paid) return false;
    if (filters.paid === "no" && candidate.paid) return false;
    if (filters.confirmed === "yes" && !candidate.confirmed) return false;
    if (filters.confirmed === "no" && candidate.confirmed) return false;
    return true;
  });
}
