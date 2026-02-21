"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";

export default function ImpactMapPanel({ baseSha, headSha }: { baseSha: string; headSha: string }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        setData(null);
        const res = await fetch(`/api/impact?base=${encodeURIComponent(baseSha)}&head=${encodeURIComponent(headSha)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`impact api failed: ${res.status}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? String(e));
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [baseSha, headSha]);

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Calculating impact map…" />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Impact map
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Based on GitHub compare.files mapped via product-model impact rules.
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip size="small" variant="outlined" label={`files: ${data?.totals?.files ?? 0}`} />
          <Chip size="small" variant="outlined" label={`matched: ${data?.totals?.matched ?? 0}`} />
          <Chip size="small" variant="outlined" label={`unmatched: ${data?.totals?.unmatched ?? 0}`} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontWeight: 900, mb: 1 }}>Domains touched</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {(data.domainsTouched ?? []).slice(0, 12).map((d: any) => (
            <Chip key={d.id} label={`${d.id} · ${d.score}`} size="small" variant="outlined" />
          ))}
          {(data.domainsTouched ?? []).length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.75 }}>—</Typography>
          )}
        </Box>

        <Typography sx={{ fontWeight: 900, mb: 1 }}>Capabilities touched</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {(data.capabilitiesTouched ?? []).slice(0, 18).map((c: any) => (
            <Chip key={c.id} label={`${c.id} · ${c.score}`} size="small" variant="outlined" />
          ))}
          {(data.capabilitiesTouched ?? []).length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.75 }}>—</Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontWeight: 900, mb: 1 }}>Unmatched files</Typography>
        <List dense sx={{ maxHeight: 220, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          {(data.unmatchedFiles ?? []).slice(0, 30).map((f: any) => (
            <ListItem key={f.filename} divider>
              <ListItemText
                primary={<Typography sx={{ fontFamily: "monospace" }}>{f.filename}</Typography>}
                secondary={`status: ${f.status ?? "—"} · changes: ${f.changes ?? "—"}`}
              />
            </ListItem>
          ))}
          {(data.unmatchedFiles ?? []).length === 0 && (
            <ListItem>
              <ListItemText primary="—" />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
}