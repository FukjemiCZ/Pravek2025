import StatusPanel from "@/components/StatusPanel";

export default async function ArchitecturePage() {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/product-model`,
    { cache: "no-store" }
  ).then(r => r.json());

  return (
    <div style={{ padding: 24 }}>
      <h1>Architecture Portal</h1>

      <StatusPanel />

      <pre>
        {JSON.stringify(data.catalog.product, null, 2)}
      </pre>
    </div>
  );
}