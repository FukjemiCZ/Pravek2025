// app/api/sponsors/route.ts
import { google } from "googleapis";
import { NextResponse } from "next/server";

type Sponsor = {
  name: string;
  logo: string;
  description: string;
  link: string;
  years: number[];
  position: number;
};

export async function GET() {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetName = process.env.SHEET_NAME_SPONSORS!;

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
      range: sheetName,
    });

    const rows = response.data.values || [];
    const [header, ...data] = rows;

    const getColIndex = (label: string) => header.indexOf(label);

    const nameIdx = getColIndex("name");
    const positionIdx = getColIndex("position");
    const year2024Idx = getColIndex("2024");
    const year2025Idx = getColIndex("2025");
    const linkIdx = getColIndex("link");
    const descriptionIdx = getColIndex("description");
    const logoIdx = getColIndex("logo");

    const sponsors: Sponsor[] = data
      .map((row) => {
        const years = [];
        if (row[year2024Idx]?.toLowerCase() === "ano") years.push(2024);
        if (row[year2025Idx]?.toLowerCase() === "ano") years.push(2025);

        const position = parseInt(row[positionIdx] || "999", 10);

        return {
          name: row[nameIdx] || "",
          logo: row[logoIdx] || "",
          description: row[descriptionIdx] || "",
          link: row[linkIdx] || "",
          years,
          position,
        };
      })
      .filter((sponsor) => sponsor.name)
      .sort((a, b) => a.position - b.position);

    return NextResponse.json({ sponsors }, { status: 200 });
  } catch (error) {
    console.error("Chyba při čtení dat sponzorů:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru." },
      { status: 500 }
    );
  }
}
