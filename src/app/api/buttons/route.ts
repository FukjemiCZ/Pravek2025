// src/app/api/buttons/route.ts

import { google } from "googleapis";
import { NextResponse } from "next/server";

/** 
 * Rozšířený ButtonItem: 
 *   - Přidali jsme `status`, 
 *   - Odstranili jsme `disabledUntil`.
 */
export interface ButtonItem {
  id: string;
  label: string;
  variant: string;
  color: string;
  status: "Skryté" | "Zakázané" | "Funkční";      // NOVÉ POLE
  actionType: "dialog" | "navigate" | "externalLink" | "apiCall";
  actionPayload: string;
  dialogComponent: string | null;
  iconName: string | null;
}

export async function GET() {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId      = process.env.SPREADSHEET_ID!;
    const sheetName          = process.env.SHEET_NAME_BUTTONS!; // např. "Tlačítka"

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

    if (rows.length < 2) {
      // Pokud nejsou žádná data (nebo jen hlavička), vrátíme prázdné pole
      return NextResponse.json<ButtonItem[]>([]);
    }

    const [header, ...dataRows] = rows;

    // Nalezneme indexy povinných sloupců
    const idxId              = header.indexOf("ID");
    const idxLabel           = header.indexOf("Label");
    const idxVariant         = header.indexOf("Variant");
    const idxColor           = header.indexOf("Color");
    const idxStatus          = header.indexOf("Status");         // NOVÉ
    const idxActionType      = header.indexOf("ActionType");
    const idxActionPayload   = header.indexOf("ActionPayload");
    const idxDialogComponent = header.indexOf("DialogComponent");
    const idxIconName        = header.indexOf("IconName");

    // Kontrola, jestli máme minimálně: ID, Label, Variant, Color, Status, ActionType, ActionPayload
    if (
      idxId             === -1 ||
      idxLabel          === -1 ||
      idxVariant        === -1 ||
      idxColor          === -1 ||
      idxStatus         === -1 ||
      idxActionType     === -1 ||
      idxActionPayload  === -1
    ) {
      throw new Error(
        'List neobsahuje některý z povinných sloupců: "ID","Label","Variant","Color","Status","ActionType","ActionPayload".'
      );
    }

    const items: ButtonItem[] = dataRows
      .map((row) => {
        // 1) ID, Label, Variant, Color
        const id      = row[idxId]?.toString()      || "";
        const label   = row[idxLabel]?.toString()   || "";
        const variant = row[idxVariant]?.toString() || "contained";
        const color   = row[idxColor]?.toString()   || "primary";

        // 2) Status
        const rawStatus = row[idxStatus]?.toString() || "";
        // Ujistíme se, že status je jedna z očekávaných hodnot; jinak 
        // vyhodíme chybu nebo nastavíme default („Funkční“).
        const statusVal: ButtonItem["status"] =
          rawStatus === "Skryté" || rawStatus === "Zakázané" || rawStatus === "Funkční"
            ? (rawStatus as ButtonItem["status"])
            : "Funkční"; // default, kdyby v tabulce byl překlep

        // 3) ActionType (opět validujeme union)
        const rawActionType = row[idxActionType]?.toString() || "";
        const actionType: ButtonItem["actionType"] =
          rawActionType === "dialog" ||
          rawActionType === "navigate" ||
          rawActionType === "externalLink" ||
          rawActionType === "apiCall"
            ? (rawActionType as ButtonItem["actionType"])
            : "navigate";

        // 4) ActionPayload
        const actionPayload = row[idxActionPayload]?.toString() || "";

        // 5) dialogComponent (pokud existuje sloupec)
        const dialogComp =
          idxDialogComponent !== -1
            ? row[idxDialogComponent]?.toString() || null
            : null;

        // 6) iconName (pokud existuje sloupec)
        const iconNameVal =
          idxIconName !== -1
            ? row[idxIconName]?.toString().trim() || null
            : null;

        return {
          id,
          label,
          variant,
          color,
          status: statusVal,
          actionType,
          actionPayload,
          dialogComponent: dialogComp,
          iconName: iconNameVal,
        };
      })
      // Odstraníme řádky, které nemají ID nebo Label
      .filter((item) => item.id.trim() !== "");

    return NextResponse.json<ButtonItem[]>(items, { status: 200 });
  } catch (err) {
    console.error("Chyba při čtení tlačítek:", err);
    return NextResponse.json(
      { error: "Interní chyba serveru při načítání tlačítek." },
      { status: 500 }
    );
  }
}
