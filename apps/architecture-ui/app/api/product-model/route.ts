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

  const data: any = {};

  for (const file of files) {
    const res = await fetch(`${BASE}/${file}`, { cache: "no-store" });
    data[file.replace(".json", "")] = await res.json();
  }

  return NextResponse.json(data);
}