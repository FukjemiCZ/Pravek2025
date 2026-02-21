import Shell from "@/app/components/layout/Shell";
import { Box, Typography } from "@mui/material";
import { getProductModel } from "@/lib/getProductModel";

// Technical widgets (předpokládám, že existují)
import GraphCanvas from "@/app/components/architecture/GraphCanvas";
import C4Viewer from "@/app/components/architecture/C4Viewer";
import ServiceMatrix from "@/app/components/architecture/ServiceMatrix";

export const dynamic = "force-dynamic";

export default async function ArchitecturePage() {
  const data = await getProductModel();

  return (
    <Shell>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Architecture
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Graph + C4 + service/capability topology.
        </Typography>
      </Box>

      <GraphCanvas catalog={data.catalog} roadmap={data.roadmap} ownership={data.ownership} />

      <Box sx={{ mt: 3 }}>
        <C4Viewer
          contextUrl="https://fukjemicz.github.io/Pravek2025/product-model/graph/c4-context.mmd"
          containerUrl="https://fukjemicz.github.io/Pravek2025/product-model/graph/c4-container.mmd"
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <ServiceMatrix
          services={data.catalog?.services ?? []}
          capabilities={data.catalog?.capabilities ?? []}
          apis={data.catalog?.apis ?? []}
          events={data.catalog?.events ?? []}
        />
      </Box>
    </Shell>
  );
}