// app/api/persons/route.ts

import { NextResponse } from "next/server";
import { google } from "googleapis";

/** 
 * Typ položky (item) tak, jak se vrátí ve výsledném JSONu. 
 * Každá položka má povinně:
 * - person_name: string  (odkaz na jméno v listu Persons)
 * - name: string         (název položky)
 * - photo: string        (URL k obrázku)
 * - description: string  (popis položky)
 * - koupeno: boolean   (true/false)
 */
interface Item {
  person_name: string;
  name: string;
  photo: string;
  description: string;
  koupeno: boolean;
}

/** 
 * Typ osoby (person) tak, jak se vrátí ve výsledném JSONu. 
 * Každá osoba má:
 * - name: string
 * - photo1: string
 * - photo2: string
 * - description: string
 * - sestypad: string
 * - items: Item[]       (pole položek, pokud žádné, bude prázdné pole)
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
    // --- 1) Načteme proměnné prostředí --- //
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetNamePersons = process.env.SHEET_NAME_PERSONS!; // "Persons"
    const sheetNameItems = process.env.SHEET_NAME_ITEMS!;     // "Items"

    // --- 2) Přetvoříme JSON string na objekt a nastavíme OAuth --- //
    const credentials = JSON.parse(serviceAccountKey);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes
    );
    const sheets = google.sheets({ version: "v4", auth });

    // --- 3) Načteme celý list Persons --- //
    const respPersons = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetNamePersons,
    });
    const rowsPersons = respPersons.data.values || [];

    // Pokud nemáme ani jeden řádek s daty (pouze hlavička nebo list prázdný), vrátíme prázdné pole
    if (rowsPersons.length < 2) {
      return NextResponse.json<Person[]>([], { status: 200 });
    }

    // 3.1) První řádek je hlavička, zbytek jsou data
    const [headerPersons, ...dataRowsPersons] = rowsPersons;

    // 3.2) Najdeme indexy sloupců v listu Persons
    const idxNameP = headerPersons.indexOf("name");
    const idxPhoto1P = headerPersons.indexOf("photo1");
    const idxPhoto2P = headerPersons.indexOf("photo2");
    const idxDescriptionP = headerPersons.indexOf("description");
    const idxSestypadP = headerPersons.indexOf("sestypad");

    if (
      idxNameP === -1 ||
      idxPhoto1P === -1 ||
      idxPhoto2P === -1 ||
      idxDescriptionP === -1 ||
      idxSestypadP === -1
    ) {
      throw new Error(
        'List "Persons" musí obsahovat tyto sloupce (přesně ve jménech): name, photo1, photo2, description, sestypad.'
      );
    }

    // 3.3) Vytvoříme mezimapu osob: key = name, hodnota = objekt Person BEZ položek
    //      (ty se přidají později)
    const personsMap: Record<string, Omit<Person, "items">> = {};

    dataRowsPersons.forEach((row) => {
      const name = row[idxNameP] || "";
      const photo1 = row[idxPhoto1P] || "";
      const photo2 = row[idxPhoto2P] || "";
      const description = row[idxDescriptionP] || "";
      const sestypad = row[idxSestypadP] || "";

      // Naplníme základní údaje, bez items
      personsMap[name] = {
        name,
        photo1,
        photo2,
        description,
        sestypad,
      };
    });

    // --- 4) Načteme celý list Items --- //
    const respItems = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetNameItems,
    });
    const rowsItems = respItems.data.values || [];

    // 4.1) Pokud v listu Items nemáme žádné řádky s daty, vytvoříme pro každou osobu prázdné items
    if (rowsItems.length < 2) {
      const resultNoItems: Person[] = Object.values(personsMap).map((p) => ({
        ...p,
        items: [],
      }));
      return NextResponse.json<Person[]>(resultNoItems, { status: 200 });
    }

    // 4.2) První řádek je hlavička, zbytek jsou data
    const [headerItems, ...dataRowsItems] = rowsItems;

    // 4.3) Najdeme indexy sloupců v listu Items
    const idxPersonNameI = headerItems.indexOf("person_name");
    const idxNameI = headerItems.indexOf("name");
    const idxPhotoI = headerItems.indexOf("photo");
    const idxDescriptionI = headerItems.indexOf("description");
    const idxkoupenoI = headerItems.indexOf("koupeno");

    if (
      idxPersonNameI === -1 ||
      idxNameI === -1 ||
      idxPhotoI === -1 ||
      idxDescriptionI === -1 ||
      idxkoupenoI === -1
    ) {
      throw new Error(
        'List "Items" musí obsahovat tyto sloupce (přesně ve jménech): person_name, name, photo, description, koupeno.'
      );
    }

    // 4.4) Vytvoříme mapu itemsByPerson podle person_name
    const itemsByPerson: Record<string, Item[]> = {};

    dataRowsItems.forEach((row) => {
      const rawPersonName = row[idxPersonNameI] || "";
      const rawItemName = row[idxNameI] || "";
      const rawPhoto = row[idxPhotoI] || "";
      const rawDescription = row[idxDescriptionI] || "";
      const rawkoupeno = row[idxkoupenoI] || "";

      // Parsujeme řetězec koupeno → boolean
      const koupeno = rawkoupeno.trim().toLowerCase() === "true";

      const item: Item = {
        person_name: rawPersonName,
        name: rawItemName,
        photo: rawPhoto,
        description: rawDescription,
        koupeno,
      };

      // Pokud osoba ještě v mapě nemá žádné položky, inicializujeme pole
      if (!itemsByPerson[rawPersonName]) {
        itemsByPerson[rawPersonName] = [];
      }
      itemsByPerson[rawPersonName].push(item);
    });

    // --- 5) Sestavení finálního pole Person[] s vloženými položkami --- //
    const finalPersons: Person[] = Object.values(personsMap).map((p) => {
      // Vytáhneme položky pro dané jméno (nebo prázdné pole, pokud tam nic není)
      const itemsForThis = itemsByPerson[p.name] || [];
      return {
        ...p,
        items: itemsForThis,
      };
    });

    // 5.1) Vrátíme finální JSON
    return NextResponse.json<Person[]>(finalPersons, { status: 200 });
  } catch (error) {
    console.error("Chyba při načítání dat z Google Sheets:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru při načítání osob." },
      { status: 500 }
    );
  }
}
