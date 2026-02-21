import Shell from "@/app/components/layout/Shell";
import { Box, Typography } from "@mui/material";
import ReleaseChangePanelWithLKG from "@/app/components/operations/ReleaseChangePanelWithLKG";


export const dynamic = "force-dynamic";

export default function ReleasesPage() {
  return (
    <Shell>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Releases & Changes
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Primárně WEB produkce — what changed, what shipped, and what’s safe to roll back to.
        </Typography>
      </Box>

      {/* (5) Compare since last known good */}
      <ReleaseChangePanelWithLKG />

    </Shell>
  );
}