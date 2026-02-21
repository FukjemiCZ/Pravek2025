"use client";

import { Box, Card, CardContent, LinearProgress, Typography, Grid } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

type Heatmap = {
  domains?: Array<{ id: string; name?: string }>;
  epics?: Array<{ id: string; name?: string; horizon?: string }>;
  matrix?: Array<{ domainId: string; epicId: string; count: number; capabilities?: string[] }>;
};

type Roadmap = {
  epics?: Array<{ id: string; horizon?: string; name?: string; capabilities?: string[]; flows?: string[] }>;
  horizons?: Array<{ id: string; name?: string }>;
};

function sumMatrixForEpicIds(heatmap: Heatmap, epicIds: Set<string>): number {
  const matrix = heatmap?.matrix ?? [];
  let sum = 0;
  for (const x of matrix) {
    if (epicIds.has(x.epicId)) sum += Number(x.count) || 0;
  }
  return sum;
}

function pct(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function BarRow({
  label,
  value,
  total,
  subtitle,
}: {
  label: string;
  value: number;
  total: number;
  subtitle?: string;
}) {
  const p = pct(value, total);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography sx={{ fontWeight: 900 }}>{label}</Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={p}
              sx={{
                height: 10,
                borderRadius: 999,
                bgcolor: "rgba(0,0,0,0.06)",
              }}
            />
          </Box>

          <Typography sx={{ fontWeight: 800, minWidth: 68, textAlign: "right" }}>
            {p}%
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
          Coverage: <b>{value}</b> / {total}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function CoverageBars({
  roadmap,
  heatmap,
}: {
  roadmap: Roadmap;
  heatmap: Heatmap;
}) {
  const allEpics = roadmap?.epics ?? [];
  const allEpicIds = new Set(allEpics.map((e) => e.id));

  const total = sumMatrixForEpicIds(heatmap, allEpicIds);

  // Group epics by horizon
  const groups = new Map<string, Set<string>>();
  for (const e of allEpics) {
    const h = (e.horizon || "unspecified").toLowerCase();
    if (!groups.has(h)) groups.set(h, new Set());
    groups.get(h)!.add(e.id);
  }

  // Stable ordering for horizon groups: now, next, later, unspecified, others
  const order = ["now", "next", "later", "unspecified"];
  const keys = Array.from(groups.keys()).sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const horizonName = new Map<string, string>();
  for (const h of roadmap?.horizons ?? []) {
    horizonName.set((h.id || "").toLowerCase(), h.name || h.id);
  }

  return (
    <SectionCard
      title="Coverage"
      subtitle="How much scope (capability counts) is covered by epics per horizon. Uses heatmap.matrix counts."
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <BarRow label="Total coverage" value={total} total={Math.max(total, 1)} subtitle="Reference total from heatmap (all epics)" />
        </Grid>

        {keys.map((k) => {
          const epicIds = groups.get(k)!;
          const v = sumMatrixForEpicIds(heatmap, epicIds);

          return (
            <Grid item xs={12} md={6} key={k}>
              <BarRow
                label={horizonName.get(k) ?? k.toUpperCase()}
                value={v}
                total={Math.max(total, 1)}
                subtitle={`Epics: ${epicIds.size}`}
              />
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="body2" sx={{ opacity: 0.75, mt: 2 }}>
        Note: Coverage is computed from <code>heatmap.matrix[].count</code> (capability references). It’s a planning signal, not a runtime health metric.
      </Typography>
    </SectionCard>
  );
}