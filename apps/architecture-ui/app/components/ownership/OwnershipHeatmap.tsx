"use client";

import { useMemo, useState } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

export default function OwnershipHeatmap({
  ownership,
  catalog,
}: {
  ownership: any;
  catalog: any;
}) {
  const teams = ownership?.teams ?? [];
  const domains = catalog?.domains ?? [];
  const caps = catalog?.capabilities ?? [];

  // domainId -> ownerTeamId
  const domainOwner = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of ownership?.domains ?? []) m.set(d.id, d.owner);
    return m;
  }, [ownership]);

  // Count per team/domain: number of capabilities in that domain
  const matrix = useMemo(() => {
    const m = new Map<string, number>(); // team::domain -> count
    for (const c of caps) {
      const dom = c.domain;
      const owner = domainOwner.get(dom) ?? "unassigned";
      const key = `${owner}::${dom}`;
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [caps, domainOwner]);

  const rows = useMemo(() => {
    // include unassigned row
    const ids = new Set<string>(teams.map((t: any) => t.id));
    ids.add("unassigned");
    return Array.from(ids.values()).sort();
  }, [teams]);

  return (
    <SectionCard title="Ownership map" subtitle="Team × Domain (capability count)">
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 900, bgcolor: "background.paper", borderRadius: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Team \\ Domain</TableCell>
              {domains.map((d: any) => (
                <TableCell key={d.id} sx={{ fontWeight: 800 }}>
                  {d.id}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((teamId) => (
              <TableRow key={teamId} hover>
                <TableCell sx={{ fontWeight: 700 }}>{teamId}</TableCell>
                {domains.map((d: any) => {
                  const v = matrix.get(`${teamId}::${d.id}`) ?? 0;
                  return (
                    <TableCell
                      key={d.id}
                      sx={{
                        textAlign: "center",
                        bgcolor: v === 0 ? "background.paper" : "rgba(11,95,255,0.08)",
                        fontVariantNumeric: "tabular-nums",
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

      <Typography variant="body2" sx={{ opacity: 0.75, mt: 2 }}>
        Note: This heatmap uses domain ownership. Capability-level ownership overrides can be added later.
      </Typography>
    </SectionCard>
  );
}