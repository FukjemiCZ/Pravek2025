"use client";

import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

function groupBy<T>(arr: T[], keyFn: (x: T) => string) {
  const m = new Map<string, T[]>();
  for (const x of arr) {
    const k = keyFn(x) || "unspecified";
    m.set(k, [...(m.get(k) ?? []), x]);
  }
  return m;
}

export default function Timeline({ roadmap }: { roadmap: any }) {
  const epics = (roadmap?.epics ?? []).slice();
  epics.sort((a: any, b: any) => (a.horizon ?? "").localeCompare(b.horizon ?? "") || (a.id ?? "").localeCompare(b.id ?? ""));

  const grouped = groupBy(epics, (e: any) => e.horizon ?? "unspecified");

  return (
    <SectionCard title="Roadmap" subtitle="Epics grouped by horizon (clean business view)">
      <Grid container spacing={2}>
        {Array.from(grouped.entries()).map(([h, items]) => (
          <Grid item xs={12} md={4} key={h}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  {h.toUpperCase()}
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
                  Epics: {items.length}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {items.map((e: any) => (
                    <Chip
                      key={e.id}
                      label={e.id}
                      variant="outlined"
                      size="small"
                      title={e.name ?? ""}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}