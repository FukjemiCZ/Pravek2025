// app/api/persons/route.ts

import { NextResponse } from "next/server";
import { google } from "googleapis";

/** 
 * Typ položky (item), jak má vypadat výsledné JSON pole. 
 */
interface Item {
  person_name: string;
  name: string;
  photo: string;
  description: string;
  collected: boolean;
}

/** 
 * Typ osoby (person), jak se vrátí ve výsledném JSONu. 
 */
interface Person {
  name: string;
  photo1: string;
  photo2: string;
  description: string;
  sestypad: string;
  items: Item[];
}

export async function GET() {
  try {
    // 1) Načteme proměnné prostředí
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetNamePersons = process.env.SHEET_NAME_PERSONS!; // "Persons"
    const sheetNameItems = process.env.SHEET_NAME_ITEMS!;     // "Items"
    const currentRocnik = process.env.ROCNIK!;                // např. "2025"

    // 2) Přetvoříme JSON klíč na objekt a připravíme OAuth
    const credentials = JSON.parse(serviceAccountKey);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes
    );
    const sheets = google.sheets({ version: "v4", auth });

    // ------------------------------------------------------------
    // 3) Načtení a zpracování listu "Persons"
    // ------------------------------------------------------------
    const respPersons = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetNamePersons,
    });
    const rowsPersons = respPersons.data.values || [];

    // Pokud máme jen hlavičku nebo je list prázdný, vrátíme prázdné pole
    if (rowsPersons.length < 2) {
      return NextResponse.json<Person[]>([], { status: 200 });
    }

    // Rozdělíme první řádek (hlavička) a datové řádky
    const [rawHeaderPersons, ...dataRowsPersons] = rowsPersons;

    // Normalize hlavičku (trim + lowercase) pro robustní porovnání
    const headerPersons = rawHeaderPersons.map((cell) =>
      (cell || "").toString().trim().toLowerCase()
    );

    // Najdeme indexy sloupců v listu Persons (use lowercase keys)
    const idxNameP = headerPersons.indexOf("name");
    const idxPhoto1P = headerPersons.indexOf("photo1");
    const idxPhoto2P = headerPersons.indexOf("photo2");
    const idxDescriptionP = headerPersons.indexOf("description");
    const idxSestypadP = headerPersons.indexOf("sestypad");
    const idxRocnikP = headerPersons.indexOf("rocnik");

    if (
      idxNameP === -1 ||
      idxPhoto1P === -1 ||
      idxPhoto2P === -1 ||
      idxDescriptionP === -1 ||
      idxSestypadP === -1 ||
      idxRocnikP === -1
    ) {
      throw new Error(
        'List "Persons" musí obsahovat sloupce (bez diakritiky, trim, lowercase): name, photo1, photo2, description, sestypad, rocnik.'
      );
    }

    // Vytvoříme mezimapu osob, klíč = name, hodnota = Person (bez položek)
    // Přidáme pouze ty řádky, kde hodnota v sloupci rocnik === currentRocnik
    const personsMap: Record<string, Omit<Person, "items">> = {};

    dataRowsPersons.forEach((row) => {
      // Přiřazení hodnot podle indexů
      const name = (row[idxNameP] || "").toString().trim();
      const photo1 = (row[idxPhoto1P] || "").toString().trim();
      const photo2 = (row[idxPhoto2P] || "").toString().trim();
      const description = (row[idxDescriptionP] || "").toString().trim();
      const sestypad = (row[idxSestypadP] || "").toString().trim();
      const rocnikValue = (row[idxRocnikP] || "").toString().trim();

      // Zařadíme do mapy jen, pokud rocnikValue === aktuální proměnná currentRocnik
      if (rocnikValue === currentRocnik) {
        personsMap[name] = {
          name,
          photo1,
          photo2,
          description,
          sestypad,
        };
      }
    });

    // ------------------------------------------------------------
    // 4) Načtení a zpracování listu "Items"
    // ------------------------------------------------------------
    const respItems = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetNameItems,
    });
    const rowsItems = respItems.data.values || [];

    // Pokud je v Items pouze hlavička nebo je list prázdný, vrátíme každou osobu s prázdným polem items
    if (rowsItems.length < 2) {
      const resultNoItems: Person[] = Object.values(personsMap).map((p) => ({
        ...p,
        items: [],
      }));
      return NextResponse.json<Person[]>(resultNoItems, { status: 200 });
    }

    // Rozdělíme první řádek (hlavička) a datové řádky
    const [rawHeaderItems, ...dataRowsItems] = rowsItems;

    // Normalize hlavičku (trim + lowercase) pro robustní porovnání
    const headerItems = rawHeaderItems.map((cell) =>
      (cell || "").toString().trim().toLowerCase()
    );

    // Najdeme indexy sloupců v listu Items (bez ohledu na order)
    const idxPersonNameI = headerItems.indexOf("person_name");
    const idxNameI = headerItems.indexOf("name");
    const idxPhotoI = headerItems.indexOf("photo");
    const idxDescriptionI = headerItems.indexOf("description");
    const idxKoupenoI = headerItems.indexOf("koupeno");
    const idxRocnikI = headerItems.indexOf("rocnik");

    if (
      idxPersonNameI === -1 ||
      idxNameI === -1 ||
      idxPhotoI === -1 ||
      idxDescriptionI === -1 ||
      idxKoupenoI === -1 ||
      idxRocnikI === -1
    ) {
      throw new Error(
        'List "Items" musí obsahovat sloupce (bez diakritiky, trim, lowercase): person_name, name, photo, description, koupeno, rocnik.'
      );
    }

    // Seskupíme položky podle person_name, ale pouze pro ty řádky, kde rocnik === currentRocnik
    const itemsByPerson: Record<string, Item[]> = {};

    dataRowsItems.forEach((row) => {
      // Přiřazení hodnot podle indexů
      const rawPersonName = (row[idxPersonNameI] || "").toString().trim();
      const rawItemName = (row[idxNameI] || "").toString().trim();
      const rawPhoto = (row[idxPhotoI] || "").toString().trim();
      const rawDescription = (row[idxDescriptionI] || "").toString().trim();
      const rawKoupeno = (row[idxKoupenoI] || "").toString().trim();
      const rocnikValue = (row[idxRocnikI] || "").toString().trim();

      // Přijmeme jen, pokud řádek odpovídá aktuálnímu ročníku
      if (rocnikValue === currentRocnik) {
        const collected = rawKoupeno.toLowerCase() === "true";
        const item: Item = {
          person_name: rawPersonName,
          name: rawItemName,
          photo: rawPhoto,
          description: rawDescription,
          collected,
        };

        // Pokud osoba (person_name) není v personsMap vůbec, vynecháme ji
        if (personsMap[rawPersonName]) {
          if (!itemsByPerson[rawPersonName]) {
            itemsByPerson[rawPersonName] = [];
          }
          itemsByPerson[rawPersonName].push(item);
        }
      }
    });

    // ------------------------------------------------------------
    // 5) Sestavení konečného pole Person[] s vloženými položkami
    // ------------------------------------------------------------
    const finalPersons: Person[] = Object.values(personsMap).map((p) => {
      const itemsForThis = itemsByPerson[p.name] || [];
      return {
        ...p,
        items: itemsForThis,
      };
    });

    // 5.1) Vrátíme JSON odpověď
    return NextResponse.json<Person[]>(finalPersons, { status: 200 });
  } catch (error) {
    console.error("Chyba při načítání dat z Google Sheets:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru při načítání osob." },
      { status: 500 }
    );
  }
}
