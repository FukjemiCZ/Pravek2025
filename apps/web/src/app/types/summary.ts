// summary-types.ts

export interface Beneficiary {
  name: string;
  subtitle: string;
  description: string;
  dialogText: string;
  image: string;
}

export interface SummaryData {
  year: string;                 // např. "2024"
  amount: string;               // např. "154 000 Kč"
  beneficiaries: Beneficiary[]; // jeden nebo více
  mapImages: string[];          // obrázky map
}

export interface SummariesResponse {
  summaries: SummaryData[];
}
