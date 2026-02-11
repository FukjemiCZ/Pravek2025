// app/api/gallery/route.ts
import { google } from "googleapis";
import { NextResponse } from "next/server";

type GalleryRow = {
  name: string;
  position: number;
  gallery: string;
  zobrazovat: string; // "ANO" / "NE" (vracíme jak je v tabulce, jen normalizujeme trim)
  src: string;
};

function toNumberSafe(v: unknown, fallback = 999999): number {
  const s = String(v ?? "").trim().replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // FE typicky volá /api/gallery?gallery=Eliska
    const galleryFilter = (url.searchParams.get("gallery") || "").trim();

    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Můžeš mít env, ale když není, použije se list "gallery"
    const sheetName = (process.env.SHEET_NAME_GALLERY || "gallery").trim();

    if (!serviceAccountKey) {
      return NextResponse.json(
        { error: "Není nastavená env-proměnná GOOGLE_SERVICE_ACCOUNT_KEY." },
        { status: 500 }
      );
    }
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Není nastavená env-proměnná SPREADSHEET_ID." },
        { status: 500 }
      );
    }

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
    if (rows.length === 0) {
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    const [header, ...data] = rows;

    const getColIndex = (label: string) => header.indexOf(label);
    const nameIdx = getColIndex("name");
    const positionIdx = getColIndex("position");
    const galleryIdx = getColIndex("gallery");
    const zobrazovatIdx = getColIndex("zobrazovat");
    const srcIdx = getColIndex("src");

    const missing = [
      ["name", nameIdx],
      ["position", positionIdx],
      ["gallery", galleryIdx],
      ["zobrazovat", zobrazovatIdx],
      ["src", srcIdx],
    ].filter(([, idx]) => idx === -1);

    if (missing.length) {
      return NextResponse.json(
        {
          error:
            "V tabulce chybí povinné sloupce: " +
            missing.map(([k]) => `"${k}"`).join(", "),
        },
        { status: 500 }
      );
    }

    const images: GalleryRow[] = data
      .map((row) => {
        const name = String(row[nameIdx] ?? "").trim();
        const position = toNumberSafe(row[positionIdx], 999999);
        const gallery = String(row[galleryIdx] ?? "").trim();
        const zobrazovat = String(row[zobrazovatIdx] ?? "").trim(); // vracíme "ANO"/"NE" jak je v sheetu
        const src = String(row[srcIdx] ?? "").trim();

        return { name, position, gallery, zobrazovat, src };
      })
      .filter((r) => r.name && r.gallery && r.src) // základní validace
      .filter((r) => {
        if (!galleryFilter) return true; // bez filtru vrátí vše
        return r.gallery.toLowerCase() === galleryFilter.toLowerCase();
      })
      .sort((a, b) => a.position - b.position);

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error("Chyba při čtení gallery z Google Sheets:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru." },
      { status: 500 }
    );
  }
}
