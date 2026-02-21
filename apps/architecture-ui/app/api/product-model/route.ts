import { NextResponse } from "next/server";

const BASE =
  "https://raw.githubusercontent.com/FukjemiCZ/Pravek2025/main/dist/product-model";

export async function GET() {
  const files = [
    "catalog.json",
    "heatmap.json",
    "runtime.json",
    "roadmap.json",
    "ownership.json"
  ];

  const result: any = {};

  for (const f of files) {
    const r = await fetch(`${BASE}/${f}`, { cache: "no-store" });
    result[f.replace(".json", "")] = await r.json();
  }

  return NextResponse.json(result);
}