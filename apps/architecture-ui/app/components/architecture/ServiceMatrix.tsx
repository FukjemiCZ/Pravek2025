"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

type Service = { id: string; implements?: string[] };
type Capability = { id: string; domain: string; description?: string };
type Api = { id: string; endpoints?: string[] };
type Event = { id: string };

export default function ServiceMatrix({
  services,
  capabilities,
  apis,
  events,
}: {
  services: Service[];
  capabilities: Capability[];
  apis?: Api[];
  events?: Event[];
}) {
  const [q, setQ] = useState("");

  const capById = useMemo(() => {
    const m = new Map<string, Capability>();
    for (const c of capabilities ?? []) m.set(c.id, c);
    return m;
  }, [capabilities]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const items = (services ?? []).map((s) => {
      const impl = s.implements ?? [];
      const byDomain = new Map<string, string[]>();

      for (const capId of impl) {
        const c = capById.get(capId);
        const domain = c?.domain ?? "unknown";
        byDomain.set(domain, [...(byDomain.get(domain) ?? []), capId]);
      }

      const domainKeys = Array.from(byDomain.keys()).sort();
      const domains = domainKeys.map((d) => ({ domain: d, caps: (byDomain.get(d) ?? []).sort() }));

      return { id: s.id, implCount: impl.length, domains };
    });

    const filtered = query
      ? items.filter((r) => r.id.toLowerCase().includes(query))
      : items;

    filtered.sort((a, b) => a.id.localeCompare(b.id));
    return filtered;
  }, [services, capById, q]);

  return (
    <SectionCard
      title="Service matrix"
      subtitle="Service → implemented capabilities (grouped by domain)."
      actions={
        <TextField
          size="small"
          label="Search service"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      }
    >
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 1000, bgcolor: "background.paper", borderRadius: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>Service</TableCell>
              <TableCell sx={{ fontWeight: 900, width: 140 }}># Caps</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>Capabilities by domain</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontFamily: "monospace" }}>{r.id}</TableCell>
                <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{r.implCount}</TableCell>
                <TableCell>
                  {!r.domains.length ? (
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                      —
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {r.domains.map((d) => (
                        <Box key={d.domain} sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
                          <Chip label={d.domain} size="small" variant="outlined" />
                          {d.caps.slice(0, 12).map((capId) => (
                            <Chip
                              key={capId}
                              label={capId}
                              size="small"
                              variant="outlined"
                              sx={{ fontFamily: "monospace" }}
                            />
                          ))}
                          {d.caps.length > 12 && (
                            <Chip label={`+${d.caps.length - 12}`} size="small" />
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {!rows.length && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    No services found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Typography variant="body2" sx={{ opacity: 0.75, mt: 2 }}>
        Tip: In technical mode, drilldown can be added (click service → show dependency panel).
      </Typography>
    </SectionCard>
  );
}