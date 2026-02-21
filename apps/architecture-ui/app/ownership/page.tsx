import Shell from "@/app/components/layout/Shell";
import { Box, Typography } from "@mui/material";
import { getProductModel } from "@/app/lib/getProductModel";

// Ownership widgets (předpokládám, že existují)
import OwnershipHeatmap from "@/app/components/ownership/OwnershipHeatmap";
import RiskPanel from "@/app/components/ownership/RiskPanel";

export const dynamic = "force-dynamic";

export default async function OwnershipPage() {
  const data = await getProductModel();

  return (
    <Shell>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Ownership
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Team × Domain map + governance risks (orphans, missing owner).
        </Typography>
      </Box>

      <OwnershipHeatmap ownership={data.ownership} catalog={data.catalog} />
      <Box sx={{ mt: 3 }}>
        <RiskPanel ownership={data.ownership} catalog={data.catalog} roadmap={data.roadmap} />
      </Box>
    </Shell>
  );
}