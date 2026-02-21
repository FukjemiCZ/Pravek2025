import Shell from "@/app/components/layout/Shell";
import { Box, Grid, Typography } from "@mui/material";
import { getProductModel } from "@/lib/getProductModel";

// Dashboard widgets (předpokládám, že existují; pokud ne, napiš a dodám je)
import KPICards from "@/app/components/dashboard/KPICards";
import HeatmapOverview from "@/app/components/dashboard/HeatmapOverview";
import RuntimeSummary from "@/app/components/dashboard/RuntimeSummary";
import OwnershipRiskPanel from "@/app/components/ownership/RiskPanel";
import RoadmapSnapshot from "@/app/components/roadmap/Timeline";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getProductModel();

  return (
    <Shell>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Overview
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Dual-mode: Business (clean) + Technical (deep).
        </Typography>
      </Box>

      {/* KPI row */}
      <KPICards data={data} />

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={8}>
          <HeatmapOverview heatmap={data.heatmap} roadmap={data.roadmap} />
        </Grid>

        <Grid item xs={12} lg={4}>
          <RuntimeSummary runtime={data.runtime} />
        </Grid>

        <Grid item xs={12} lg={8}>
          <RoadmapSnapshot roadmap={data.roadmap} heatmap={data.heatmap} />
        </Grid>

        <Grid item xs={12} lg={4}>
          <OwnershipRiskPanel ownership={data.ownership} catalog={data.catalog} roadmap={data.roadmap} />
        </Grid>
      </Grid>
    </Shell>
  );
}