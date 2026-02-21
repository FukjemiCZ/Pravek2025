"use client";

import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { calcMetrics } from "@/app/lib/metrics";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function KPICards({ data }: { data: any }) {
  const m = calcMetrics(data);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <StatCard label="Domains" value={m.domains} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Capabilities" value={m.capabilities} hint={`Missing owner: ${m.missingCapOwner}`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Services" value={m.services} hint={`APIs: ${m.apis} • Events: ${m.events}`} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Roadmap epics" value={m.epics} hint={`Coverage entries: ${m.coverageCount}`} />
        </Grid>
      </Grid>
    </Box>
  );
}