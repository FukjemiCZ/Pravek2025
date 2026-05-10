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
  paymentStatus?: string | null;
  registrationStatus?: string | null;
  dog1Name?: string | null;
  dog1BirthDate?: string | null;
  dog1Breed?: string | null;
  dog2Name?: string | null;
  dog2BirthDate?: string | null;
  dog2Breed?: string | null;
  dog3Name?: string | null;
  dog3BirthDate?: string | null;
  dog3Breed?: string | null;
  paid: boolean;
  confirmed: boolean;
  raw: Record<string, string>;
};

function truthy(value?: string | null) {
  const v = (value || "").trim().toLowerCase();
  return ["true", "1", "ano", "yes", "y", "zaplaceno", "potvrzeno", "paid", "confirmed"].includes(v);
}

function pick(row: Record<string, string>, names: string[]) {
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
  const auth = new google.auth.JWT(credentials.client_email, undefined, credentials.private_key, [
    "https://www.googleapis.com/auth/spreadsheets.readonly"
  ]);

  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: sheetName });
  const rows = response.data.values || [];
  if (rows.length < 2) return [];

  const [header, ...dataRows] = rows;
  const keys = header.map((cell) => String(cell || "").trim().toLowerCase());

  return dataRows.map((cells, idx) => {
    const raw: Record<string, string> = {};
    keys.forEach((key, i) => (raw[key] = String(cells[i] || "").trim()));

    const fullName = pick(raw, ["name", "jmeno", "jméno", "full_name", "celé jméno"]);
    const firstName = pick(raw, ["firstname", "first_name", "jmeno", "jméno"]) || fullName?.split(" ").slice(0, -1).join(" ") || fullName || "Neznámé";
    const lastName = pick(raw, ["lastname", "last_name", "prijmeni", "příjmení"]) || fullName?.split(" ").slice(-1).join(" ") || "";
    const year = Number(pick(raw, ["rocnik", "ročník", "year"]) || filters.year);
    const email = normalizeEmail(pick(raw, ["email", "e-mail", "mail", "e-mailová adresa"]));
    const phone = normalizePhone(pick(raw, ["phone", "telefon", "mobile", "mobil", "telefonní číslo"]));
    const paymentStatus = pick(raw, ["platba", "paid", "payment", "zaplaceno"]) || null;
    const registrationStatus = pick(raw, ["stav", "status", "potvrzeno", "confirmed"]) || null;

    return {
      sourceRow: idx + 2,
      sourceKey: `${year}:${email || ""}:${phone || ""}:${idx + 2}`,
      year,
      startNumber: pick(raw, ["startnumber", "start_number", "startovní číslo", "cislo", "číslo"]) || null,
      firstName,
      lastName,
      email,
      phone,
      routeName: pick(raw, ["route", "trasa", "distance", "vzdálenost"]) || null,
      paymentStatus,
      registrationStatus,
      dog1Name: pick(raw, ["jméno 1. psa", "jmeno 1. psa", "dog1name", "dog 1 name"]) || null,
      dog1BirthDate: pick(raw, ["datum narození 1. psa", "datum narozeni 1. psa", "dog1birthdate"]) || null,
      dog1Breed: pick(raw, ["plemeno 1. psa", "dog1breed"]) || null,
      dog2Name: pick(raw, ["jméno 2. psa", "jmeno 2. psa", "dog2name", "dog 2 name"]) || null,
      dog2BirthDate: pick(raw, ["datum narození 2. psa", "datum narozeni 2. psa", "dog2birthdate"]) || null,
      dog2Breed: pick(raw, ["plemeno 2. psa", "dog2breed"]) || null,
      dog3Name: pick(raw, ["jméno 3. psa", "jmeno 3. psa", "dog3name", "dog 3 name"]) || null,
      dog3BirthDate: pick(raw, ["datum narození 3. psa", "datum narozeni 3. psa", "dog3birthdate"]) || null,
      dog3Breed: pick(raw, ["plemeno 3. psa", "dog3breed"]) || null,
      paid: truthy(paymentStatus),
      confirmed: truthy(registrationStatus),
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
