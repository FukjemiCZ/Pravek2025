import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = "https://fukjemicz.github.io/Pravek2025/product-model";

const FILES = [
  "catalog.json",
  "runtime.json",
  "roadmap.json",
  "ownership.json",
  "heatmap.json",
  "compiled.json",
] as const;

export async function GET() {
  try {
    const entries = await Promise.all(
      FILES.map(async (file) => {
        const res = await fetch(`${BASE}/${file}`, {
          // krátká cache – API může být hitované často
          next: { revalidate: 60 },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to fetch ${file}: ${res.status} ${text.slice(0, 200)}`);
        }

        return [file.replace(".json", ""), await res.json()] as const;
      })
    );

    const data = Object.fromEntries(entries);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("api/product-model error:", err);
    return NextResponse.json(
      { error: "product-model fetch failed" },
      { status: 500 }
    );
  }
}