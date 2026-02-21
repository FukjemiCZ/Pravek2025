"use client";

import { useMemo, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Divider } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

type Heatmap = {
  domains: Array<{ id: string; name?: string }>;
  epics: Array<{ id: string; name?: string; horizon?: string }>;
  matrix: Array<{ domainId: string; epicId: string; count: number; capabilities: string[] }>;
};

export default function HeatmapOverview({
  heatmap,
  roadmap,
}: {
  heatmap: Heatmap;
  roadmap?: any;
}) {
  const [selected, setSelected] = useState<{ domainId: string; epicId: string } | null>(null);

  const map = useMemo(() => {
    const m = new Map<string, { count: number; capabilities: string[] }>();
    for (const x of heatmap?.matrix ?? []) {
      m.set(`${x.domainId}::${x.epicId}`, { count: Number(x.count) || 0, capabilities: x.capabilities ?? [] });
    }
    return m;
  }, [heatmap]);

  const cell = selected ? map.get(`${selected.domainId}::${selected.epicId}`) : null;

  return (
    <SectionCard
      title="Capability Coverage"
      subtitle="Heatmap: Domain × Epic. Click cell to drill down."
    >
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 900, bgcolor: "background.paper", borderRadius: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Domain \\ Epic</TableCell>
              {(heatmap?.epics ?? []).map((e) => (
                <TableCell key={e.id} sx={{ fontWeight: 800 }}>
                  {e.id}
                  <Typography variant="caption" sx={{ display: "block", opacity: 0.75 }}>
                    {e.name ?? ""}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(heatmap?.domains ?? []).map((d) => (
              <TableRow key={d.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>
                  {d.id}
                  <Typography variant="caption" sx={{ display: "block", opacity: 0.75 }}>
                    {d.name ?? ""}
                  </Typography>
                </TableCell>

                {(heatmap?.epics ?? []).map((e) => {
                  const v = map.get(`${d.id}::${e.id}`)?.count ?? 0;
                  const active =
                    selected?.domainId === d.id && selected?.epicId === e.id;

                  return (
                    <TableCell
                      key={e.id}
                      onClick={() => setSelected({ domainId: d.id, epicId: e.id })}
                      sx={{
                        cursor: "pointer",
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                        bgcolor: v === 0 ? "background.paper" : "rgba(11,95,255,0.08)",
                        outline: active ? "2px solid rgba(11,95,255,0.55)" : "none",
                        borderRadius: 1,
                      }}
                    >
                      {v}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {selected && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontWeight: 800 }}>
            Detail: {selected.domainId} × {selected.epicId}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
            Capabilities referenced by this epic within the domain.
          </Typography>

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              overflow: "auto",
              maxHeight: 240,
              fontSize: 12,
            }}
          >
            {(cell?.capabilities ?? []).join("\n") || "—"}
          </Box>
        </>
      )}
    </SectionCard>
  );
}