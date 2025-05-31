// app/api/sponsors/route.ts
import { google } from "googleapis";
import { NextResponse } from "next/server";

type Sponsor = {
  name: string;
  logo: string;
  description: string;
  link: string;
  years: number[];    // Seznam ročníků, ve kterých sponzor „ano“
  position: number;
};

export async function GET() {
  try {
    // 1) Načteme rok, podle kterého chceme filtrovat (např. "2025")
    const rocnikEnv = process.env.ROCNIK;
    if (!rocnikEnv) {
      return NextResponse.json(
        { error: "Není nastavená env-proměnná ROCNIK." },
        { status: 500 }
      );
    }
    const rocnikNumber = parseInt(rocnikEnv, 10);
    if (isNaN(rocnikNumber)) {
      return NextResponse.json(
        { error: "Env-proměnná ROCNIK není validní číslo." },
        { status: 500 }
      );
    }

    // 2) Ostatní přístupy k env-proměnným pro Google Sheets
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetName = process.env.SHEET_NAME_SPONSORS!;

    // 3) Autorizace do Google Sheets
    const credentials = JSON.parse(serviceAccountKey);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes
    );
    const sheets = google.sheets({ version: "v4", auth });

    // 4) Dotaz na data z tabulky
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });
    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ sponsors: [] }, { status: 200 });
    }

    // 5) Rozdělíme hlavičku a data
    const [header, ...data] = rows;
    // Najdeme index sloupce, který má stejný text jako náš ROCNIK (např. "2025")
    const yearColLabel = rocnikEnv; // např. "2025"
    const yearIdx = header.indexOf(yearColLabel);
    if (yearIdx === -1) {
      return NextResponse.json(
        { error: `Nelze najít sloupec "${yearColLabel}" v tabulce.` },
        { status: 500 }
      );
    }

    // Ostatní indexy (pro úplnost, pokud budete chtít třeba polohu, logo, popis atd.)
    const getColIndex = (label: string) => header.indexOf(label);
    const nameIdx = getColIndex("name");
    const positionIdx = getColIndex("position");
    const linkIdx = getColIndex("link");
    const descriptionIdx = getColIndex("description");
    const logoIdx = getColIndex("logo");

    // 6) Sestavíme pole sponsorů, ale vyfiltrujeme jen ty, co mají v ROCNIK sloupci "ano"
    const sponsors: Sponsor[] = data
      .map((row) => {
        // Pokud daný řádek v buňce yearIdx obsahuje "ano" (bez diakritiky / bez ohledu na velikost písmen),
        // pak ho přidáme s tímto jediným rokem do pole years.
        const yearsArr: number[] = [];
        const cellValue = row[yearIdx]?.toLowerCase().trim();
        if (cellValue === "ano") {
          yearsArr.push(rocnikNumber);
        }

        // Parse pozice, pokud není, dáme velké číslo, aby byl na konci
        const position = parseInt(row[positionIdx] || "999", 10);

        return {
          name: row[nameIdx] || "",
          logo: row[logoIdx] || "",
          description: row[descriptionIdx] || "",
          link: row[linkIdx] || "",
          years: yearsArr,
          position,
        };
      })
      // Jenom sponzoři, kteří mají v poli years alespoň jeden prvek (tj. byli označeni "ano")
      .filter((sponsor) => sponsor.name && sponsor.years.length > 0)
      // Seřadíme podle pozice
      .sort((a, b) => a.position - b.position);

    // 7) Vrátíme JSON se seznamem sponsorů
    return NextResponse.json({ sponsors }, { status: 200 });
  } catch (error) {
    console.error("Chyba při čtení dat sponzorů:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru." },
      { status: 500 }
    );
  }
}
