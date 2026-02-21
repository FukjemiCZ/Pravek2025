export async function getProductModel() {
  const base =
    "https://raw.githubusercontent.com/FukjemiCZ/Pravek2025/main/dist/product-model";

  const files = [
    "catalog.json",
    "runtime.json",
    "heatmap.json",
    "roadmap.json",
    "ownership.json",
  ];

  const data: any = {};

  for (const file of files) {
    const res = await fetch(`${base}/${file}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${file}`);
    }

    data[file.replace(".json", "")] = await res.json();
  }

  return data;
}