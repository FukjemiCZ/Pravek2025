// app/api/rules/route.ts

import { google } from "googleapis";
import { NextResponse } from "next/server";

interface RuleItem {
  category: string;
  text: string;
  position: number;
}

interface RuleSection {
  title: string;
  rules: string[];
}

interface RulesResponse {
  sections: RuleSection[];
}

export async function GET() {
  try {
    // Načtení potřebných proměnných z prostředí
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetName = process.env.SHEET_NAME_RULES!;

    // Převod JSON klíče a definice rozsahu oprávnění
    const credentials = JSON.parse(serviceAccountKey);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

    // Autentizace pomocí JWT
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes
    );

    const sheets = google.sheets({ version: "v4", auth });

    // Načtení hodnot z Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      // Pokud nejsou žádná data (hlasáno pouze hlavička nebo prázdný list), vrátíme prázdnou strukturu
      return NextResponse.json<RulesResponse>({ sections: [] });
    }

    // Rozdělit první řádek jako hlavičku a zbytek jako data
    const [header, ...dataRows] = rows;

    // Najdeme indexy sloupců podle názvů v hlavičce
    const idxKategorie = header.indexOf("Kategorie");
    const idxPravidlo = header.indexOf("Pravidlo");
    const idxPozice = header.indexOf("Pozice");
    // (Sloupec "ID" je volitelný, nepotřebujeme jej pro vrácení JSON)

    // Pokud chybí povinný sloupec, vyhodíme chybu
    if (idxKategorie === -1 || idxPravidlo === -1 || idxPozice === -1) {
      throw new Error(
        'List neobsahuje povinné sloupce "Kategorie", "Pravidlo" nebo "Pozice".'
      );
    }

    // Sestavíme pole objektů RuleItem
    const ruleItems: RuleItem[] = dataRows
      .map((row) => {
        return {
          category: row[idxKategorie] || "",
          text: row[idxPravidlo] || "",
          position: parseInt(row[idxPozice] || "0", 10),
        };
      })
      // Odstraníme prázdné řádky (pokud chybí kategorie nebo text)
      .filter((item) => item.category.trim() !== "" && item.text.trim() !== "");

    // Seřadit nejprve podle kategorie abecedně, pak podle pozice číselně
    ruleItems.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return a.position - b.position;
    });

    // Sesumarizujeme do objektu { [kategorie]: [text1, text2, ...] }
    const grouped = ruleItems.reduce<Record<string, string[]>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item.text);
      return acc;
    }, {});

    // Převedeme na pole sekcí
    const sections: RuleSection[] = Object.entries(grouped).map(
      ([sectionTitle, ruleTexts]) => ({
        title: sectionTitle,
        rules: ruleTexts,
      })
    );

    const result: RulesResponse = { sections };

    return NextResponse.json<RulesResponse>(result, { status: 200 });
  } catch (error) {
    console.error("Chyba při čtení dat pravidel:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru při načítání pravidel." },
      { status: 500 }
    );
  }
}
