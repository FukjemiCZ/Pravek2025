import Shell from "@/app/components/layout/Shell";
import { Box, Typography } from "@mui/material";
import { getProductModel } from "@/app/lib/getProductModel";

import Timeline from "@/app/components/roadmap/Timeline";
import CoverageBars from "@/app/components/roadmap/CoverageBars";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const data = await getProductModel();

  return (
    <Shell>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Roadmap
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Epics → capabilities → flows, with coverage.
        </Typography>
      </Box>

      <CoverageBars roadmap={data.roadmap} heatmap={data.heatmap} />

      <Box sx={{ mt: 3 }}>
        {/* FIX: Timeline zatím bere jen roadmap */}
        <Timeline roadmap={data.roadmap} />
      </Box>
    </Shell>
  );
}