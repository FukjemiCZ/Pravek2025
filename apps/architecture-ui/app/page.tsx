import Shell from "@/app/components/layout/Shell";
import StatusPanel from "@/app/components/status/StatusPanel";
import RuntimePanel from "@/app/components/runtime/RuntimePanel";
import Heatmap from "@/app/components/heatmap/Heatmap";
import Roadmap from "@/app/components/roadmap/Roadmap";
import OwnershipMap from "@/app/components/ownership/OwnershipMap";

export default async function ArchitecturePage() {
  const data = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/product-model",
    { cache: "no-store" }
  ).then((r) => r.json());

  return (
    <Shell>
      <StatusPanel />
      <RuntimePanel runtime={data.runtime} />
      <Heatmap heatmap={data.heatmap} />
      <Roadmap roadmap={data.roadmap} />
      <OwnershipMap ownership={data.ownership} />
    </Shell>
  );
}