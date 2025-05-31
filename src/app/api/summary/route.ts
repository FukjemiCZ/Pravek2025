// app/api/summary/route.ts

import { google } from "googleapis";
import { NextResponse } from "next/server";

interface Beneficiary {
  name: string;
  subtitle: string;
  description: string;
  dialogText: string;
  image: string;
}

interface SummaryResponse {
  year: string;
  amount: string;
  beneficiaries: Beneficiary[];
  mapImages: string[];
}

interface SummariesResponse {
  summaries: SummaryResponse[];
}

export async function GET() {
  try {
    // ==== 1) Načtení environment proměnných ====
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetName = process.env.SHEET_NAME_SUMMARY!; // např. "SummaryAllYears"

    // Autentizace přes Google Service Account klíč (JWT)
    const credentials = JSON.parse(serviceAccountKey);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes
    );
    const sheets = google.sheets({ version: "v4", auth });

    // ==== 2) Načteme celý sheet ====
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName, // celý sheet
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      // Pouze hlavička nebo prázdný sheet
      return NextResponse.json<SummariesResponse | { error: string }>(
        { error: "Tabulka neobsahuje žádná data." },
        { status: 204 }
      );
    }

    // ==== 3) Rozdělení na hlavičku a data ====
    const [header, ...dataRows] = rows;

    // ==== 4) Najdeme indexy povinných sloupců ====
    const idxYear = header.indexOf("Year");
    const idxAmount = header.indexOf("Amount");
    const idxBName = header.indexOf("BeneficiaryName");
    const idxBSubtitle = header.indexOf("BeneficiarySubtitle");
    const idxBDescription = header.indexOf("BeneficiaryDescription");
    const idxBImage = header.indexOf("BeneficiaryImage");

    if (
      idxYear === -1 ||
      idxAmount === -1 ||
      idxBName === -1 ||
      idxBSubtitle === -1 ||
      idxBDescription === -1 ||
      idxBImage === -1
    ) {
      throw new Error(
        'List musí obsahovat sloupce "Year", "Amount", "BeneficiaryName", "BeneficiarySubtitle", "BeneficiaryDescription" a "BeneficiaryImage".'
      );
    }

    // ==== 5) Dynamické hledání sloupců „BeneficiaryDialogParaX“ ====
    const dialogParaIndices = header
      .map((colName, idx) => ({ colName, idx }))
      .filter((o) => /^BeneficiaryDialogPara\d+$/.test(o.colName))
      .sort((a, b) => {
        const numA = parseInt(a.colName.replace("BeneficiaryDialogPara", ""), 10);
        const numB = parseInt(b.colName.replace("BeneficiaryDialogPara", ""), 10);
        return numA - numB;
      })
      .map((o) => o.idx);

    // ==== 6) Dynamické hledání sloupců „MapImageX“ ====
    const mapImageIndices = header
      .map((colName, idx) => ({ colName, idx }))
      .filter((o) => /^MapImage\d+$/.test(o.colName))
      .map((o) => o.idx);

    // ==== 7) Seskupíme data podle Year ====
    // Vytvoříme mapu: year -> pole řádků
    const rowsByYear = dataRows.reduce<Record<string, string[][]>>((acc, row) => {
      const cellYear = row[idxYear]?.trim() || "";
      if (!cellYear) return acc; // ignorujeme prázdné řádky bez Year
      if (!acc[cellYear]) {
        acc[cellYear] = [];
      }
      acc[cellYear].push(row);
      return acc;
    }, {});

    // ==== 8) Vygenerujeme pole SummaryResponse pro každý rok ====
    const summaries: SummaryResponse[] = Object.entries(rowsByYear).map(
      ([year, rowsForYear]) => {
        // Bereme amount z první řádky (stejné pro všechny řádky daného roku)
        const amountValue = rowsForYear[0][idxAmount] || "";

        // Beneficiaries: pro každý řádek, který má alespoň Name, Subtitle a Description
        const beneficiaries: Beneficiary[] = rowsForYear
          .filter((row) => {
            return (
              row[idxBName]?.trim() !== "" &&
              row[idxBSubtitle]?.trim() !== "" &&
              row[idxBDescription]?.trim() !== ""
            );
          })
          .map((row) => {
            // Sestavíme dialogText spojením všech „Para“ sloupců oddělených "\n\n"
            const paras: string[] = dialogParaIndices
              .map((i) => row[i]?.trim() || "")
              .filter((text) => text !== "");
            const dialogText = paras.length > 0 ? paras.join("\n\n") : "";

            return {
              name: row[idxBName] || "",
              subtitle: row[idxBSubtitle] || "",
              description: row[idxBDescription] || "",
              dialogText,
              image: row[idxBImage] || "",
            };
          });

        // Map images: z každého řádku všechna pole „MapImageX“, odstraníme prázdné a duplicitní
        const mapImagesSet = new Set<string>();
        rowsForYear.forEach((row) => {
          mapImageIndices.forEach((i) => {
            const val = row[i];
            if (val && val.trim() !== "") {
              mapImagesSet.add(val);
            }
          });
        });
        const mapImages = Array.from(mapImagesSet);

        return {
          year,
          amount: amountValue,
          beneficiaries,
          mapImages,
        };
      }
    );

    // ==== 9) Vracíme JSON se seznamem všech ročníků ====
    const result: SummariesResponse = { summaries };
    return NextResponse.json<SummariesResponse>(result, { status: 200 });
  } catch (error) {
    console.error("Chyba při načítání summary:", error);
    return NextResponse.json(
      { error: "Interní chyba při načítání dat." },
      { status: 500 }
    );
  }
}
