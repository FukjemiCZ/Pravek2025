export const dynamic = "force-dynamic";

const BASE =
  "https://fukjemicz.github.io/Pravek2025/product-model";

export async function getProductModel() {
  const files = [
    "catalog.json",
    "compiled.json",
    "runtime.json",
    "roadmap.json",
    "ownership.json",
    "heatmap.json",
  ];

  const data: any = {};

  await Promise.all(
    files.map(async (file) => {
      const res = await fetch(`${BASE}/${file}`, {
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${file}`);
      }

      data[file.replace(".json", "")] = await res.json();
    })
  );

  return data;
}