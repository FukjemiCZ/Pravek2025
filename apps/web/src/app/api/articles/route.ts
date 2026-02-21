// app/api/articles/route.ts

import { google } from "googleapis";
import { NextResponse } from "next/server";

interface ArticleItem {
  id: number;
  title: string;
  image: string;
  dialogImage: string;
  excerpt: string;
  showReadMoreButton: boolean;
  content: string;
  url?: string;
}

export async function GET() {
  try {
    // Načtení proměnných z prostředí
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetName = process.env.SHEET_NAME_ARTICLES!; // Např. "Articles"

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

    // Načtení hodnot z Google Sheets (předpokládá se první řádek jako hlavička)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return NextResponse.json<{ articles: ArticleItem[] }>({ articles: [] });
    }

    // Rozdělit první řádek jako hlavičku a zbytek jako data
    const [header, ...dataRows] = rows;

    // Najdeme indexy sloupců podle názvů v hlavičce
    const idxId = header.indexOf("ID");
    const idxTitle = header.indexOf("Title");
    const idxImage = header.indexOf("Image");
    const idxDialogImage = header.indexOf("DialogImage");
    const idxExcerpt = header.indexOf("Excerpt");
    const idxShowReadMore = header.indexOf("ShowReadMoreButton");
    const idxContent = header.indexOf("Content");
    const idxUrl = header.indexOf("URL");

    // Ověření povinných sloupců
    if (
      idxId === -1 ||
      idxTitle === -1 ||
      idxImage === -1 ||
      idxDialogImage === -1 ||
      idxExcerpt === -1 ||
      idxShowReadMore === -1 ||
      idxContent === -1
    ) {
      throw new Error(
        'List neobsahuje povinné sloupce "ID", "Title", "Image", "DialogImage", "Excerpt", "ShowReadMoreButton" nebo "Content".'
      );
    }

    // Sestavení pole objektů ArticleItem
    const articles: ArticleItem[] = dataRows
      .map((row) => {
        const rawId = row[idxId] || "";
        const rawShow = row[idxShowReadMore] || "";
        return {
          id: parseInt(rawId.toString(), 10) || 0,
          title: row[idxTitle] || "",
          image: row[idxImage] || "",
          dialogImage: row[idxDialogImage] || "",
          excerpt: row[idxExcerpt] || "",
          showReadMoreButton:
            rawShow.toString().toLowerCase() === "true" || rawShow === "1",
          content: row[idxContent] || "",
          url:
            idxUrl !== -1 && row[idxUrl] && row[idxUrl].trim() !== ""
              ? row[idxUrl]
              : undefined,
        };
      })
      .filter((item) => item.id > 0 && item.title.trim() !== "");

    // Seradit podle id vzestupně
    articles.sort((a, b) => a.id - b.id);

    return NextResponse.json<{ articles: ArticleItem[] }>({ articles }, { status: 200 });
  } catch (error) {
    console.error("Chyba při čtení dat článků:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru při načítání dat článků." },
      { status: 500 }
    );
  }
}
