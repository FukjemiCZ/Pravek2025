const BASE =
  "https://fukjemicz.github.io/Pravek2025/product-model";

export async function getProductModel() {
  const files = [
    "catalog.json",
    "runtime.json",
    "heatmap.json",
    "roadmap.json",
    "ownership.json",
  ];

  const data: any = {};

  for (const file of files) {
    const res = await fetch(`${BASE}/${file}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${file}`);
    }

    data[file.replace(".json", "")] = await res.json();
  }

  return data;
}
