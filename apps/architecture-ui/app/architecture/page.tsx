import Shell from "@/app/components/layout/Shell";
import Heatmap from "@/app/components/heatmap/Heatmap";
import Roadmap from "@/app/components/roadmap/Roadmap";
import OwnershipMap from "@/app/components/ownership/OwnershipMap";
import GraphView from "@/app/components/graph/GraphView";
import { getProductModel } from "@/app/lib/getProductModel";

export const dynamic = "force-dynamic";
export default async function ArchitecturePage() {
  const data = await getProductModel();

  return (
    <Shell>
      <h1>Architecture</h1>

      <GraphView relations={data.catalog?.relations ?? { nodes: [], edges: [] }} />

      <Heatmap heatmap={data.heatmap} />

      <Roadmap roadmap={data.roadmap} />

      <OwnershipMap ownership={data.ownership} />
    </Shell>
  );
}