"use client";

import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

export default function FeatureMatrix({ runtime }: { runtime: any }) {
  const flags = runtime?.featureFlags ?? {};
  const entries = Object.entries(flags).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <SectionCard title="Feature flags" subtitle="Runtime toggles (business safe view)">
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 600, bgcolor: "background.paper", borderRadius: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Flag</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>State</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(([k, v]) => (
              <TableRow key={k} hover>
                <TableCell sx={{ fontFamily: "monospace" }}>{k}</TableCell>
                <TableCell>{v ? "ON" : "OFF"}</TableCell>
              </TableRow>
            ))}
            {!entries.length && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    No feature flags configured.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </SectionCard>
  );
}