"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";

type Check = {
  id: string;
  title: string;
  severity: "blocker" | "warning" | "info";
  status: "pass" | "fail" | "skip";
  detail?: string;
};

function iconFor(status: Check["status"]) {
  if (status === "pass") return <CheckCircleIcon color="success" fontSize="small" />;
  if (status === "fail") return <ErrorIcon color="error" fontSize="small" />;
  return <RemoveCircleOutlineIcon color="disabled" fontSize="small" />;
}

function chipForSeverity(s: Check["severity"]) {
  if (s === "blocker") return <Chip size="small" label="BLOCKER" color="error" variant="outlined" />;
  if (s === "warning") return <Chip size="small" label="WARN" color="warning" variant="outlined" />;
  return <Chip size="small" label="INFO" variant="outlined" />;
}

export default function ReadinessPanel() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setErr(null);
        const res = await fetch("/api/readiness", { cache: "no-store" });
        if (!res.ok) throw new Error(`readiness api failed: ${res.status}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? String(e));
      }
    }
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const activeYearId = String(data?.activeYear?.id ?? "");
  const activeYearLabel =
    (data?.activeYear?.label ? String(data.activeYear.label) : "") ||
    (activeYearId ? `Year ${activeYearId}` : "—");
  const activeYearStatus = String(data?.activeYear?.status ?? "—");

  const yearChecks: Check[] = data?.yearChecks?.[activeYearId] ?? [];
  const checks: Check[] = data?.checks ?? [];

  const grouped = useMemo(() => {
    const order: Array<Check["severity"]> = ["blocker", "warning", "info"];
    const by = (sev: Check["severity"]) => checks.filter((c) => c.severity === sev);
    const byY = (sev: Check["severity"]) => yearChecks.filter((c) => c.severity === sev);
    return {
      global: Object.fromEntries(order.map((s) => [s, by(s)])),
      year: Object.fromEntries(order.map((s) => [s, byY(s)])),
    };
  }, [checks, yearChecks]);

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Loading readiness…" />;

  const go = data?.goNoGo?.status === "GO";
  const banner = go ? "success" : "error";

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Year Readiness (Go/No-Go)
            </Typography>

            {/* ✅ TADY je oprava: žádné string uvozovky, čistý JSX */}
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Active year: {activeYearLabel} ({activeYearStatus})
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`Result: ${data?.goNoGo?.status ?? "—"}`}
              color={go ? "success" : "error"}
              variant="outlined"
            />
            <Chip label={`Blockers: ${data?.goNoGo?.blockersFailed ?? 0}`} variant="outlined" />
            <Chip label={`Year blockers: ${data?.goNoGo?.yearBlockersFailed ?? 0}`} variant="outlined" />
          </Box>
        </Box>

        <Alert severity={banner} sx={{ mt: 2 }}>
          {go ? "GO: žádné blokery pro release/aktivaci." : "NO-GO: existují blokery – oprav nebo vypni feature/endpoint."}
        </Alert>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Global checks</Typography>
            <CheckList blocks={grouped.global as any} />
          </Grid>

          <Grid item xs={12} lg={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Active year checks</Typography>
            <CheckList blocks={grouped.year as any} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function CheckList({ blocks }: { blocks: Record<"blocker" | "warning" | "info", Check[]> }) {
  const sections: Array<["blocker" | "warning" | "info", string]> = [
    ["blocker", "Blockers"],
    ["warning", "Warnings"],
    ["info", "Info"],
  ];

  return (
    <Box>
      {sections.map(([sev, label]) => (
        <Box key={sev} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
            <Chip label={`${blocks[sev].length}`} size="small" variant="outlined" />
          </Box>

          <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            {blocks[sev].length === 0 ? (
              <ListItem>
                <ListItemText primary="—" />
              </ListItem>
            ) : (
              blocks[sev].map((c) => (
                <ListItem key={c.id} divider>
                  <ListItemIcon sx={{ minWidth: 32 }}>{iconFor(c.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {chipForSeverity(c.severity)}
                        <Typography sx={{ fontWeight: 700 }}>{c.title}</Typography>
                      </Box>
                    }
                    secondary={c.detail ?? ""}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      ))}
    </Box>
  );
}