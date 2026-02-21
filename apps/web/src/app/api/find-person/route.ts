import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const HEADERS = [
  "Platba", "Stav", "Časová značka", "E-mailová adresa", "Jméno", "Přijmení", "Telefonní číslo"
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = (body?.query || "").trim();

    if (!input) {
      return NextResponse.json(
        { error: "Tělo požadavku musí obsahovat { query: 'email nebo telefon' }." },
        { status: 400 }
      );
    }

    const isEmail = input.includes("@");
    const searchField = isEmail ? "E-mailová adresa" : "Telefonní číslo";

    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetName = process.env.SHEET_NAME!;

    const credentials = JSON.parse(serviceAccountKey);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes
    );

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName
    });

    const rows = response.data.values || [];
    const [header, ...data] = rows;

    const columnIndex = header.indexOf(searchField);
    if (columnIndex === -1) {
      return NextResponse.json(
        { error: `Sloupec '${searchField}' nebyl nalezen.` },
        { status: 500 }
      );
    }

    const matches = data.filter((row) => {
      const value = row[columnIndex]?.trim().toLowerCase();
      return value === input.toLowerCase();
    });

    const formatted = matches.map((row) => {
      const obj: Record<string, string> = {};
      HEADERS.forEach((col, i) => {
        obj[col] = row[i] || "";
      });
      return obj;
    });

    return NextResponse.json({ results: formatted }, { status: 200 });
  } catch (error: unknown) {
    console.error("Chyba při hledání:", error);
    return NextResponse.json({ error: "Interní chyba serveru." }, { status: 500 });
  }
}
