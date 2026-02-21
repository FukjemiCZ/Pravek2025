"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";

type ApiStatusResp = {
  overall?: "up" | "down";
  avg30d?: number | null;
  monitors?: any[];
  raw?: any;
};

function parseRatios(v: unknown): number[] {
  // custom_uptime_ratio často přijde jako "99.99-99.95-99.90-99.80"
  if (typeof v !== "string") return [];
  return v
    .split("-")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n));
}

function fmtPct(n: unknown): string {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "—";
  return `${num.toFixed(3)}%`;
}

function fmtMs(n: unknown): string {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "—";
  return `${Math.round(num)} ms`;
}

function fmtUnix(ts: unknown): string {
  // UptimeRobot často vrací epoch (seconds)
  const num = typeof ts === "number" ? ts : Number(ts);
  if (!Number.isFinite(num)) return "—";
  const d = new Date(num * 1000);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().replace("T", " ").replace("Z", " UTC");
}

function monitorStatusLabel(status: number): { label: string; color: any } {
  // UptimeRobot:
  // 0=paused, 1=not checked yet, 2=up, 8=seems down, 9=down
  if (status === 2) return { label: "UP", color: "success" };
  if (status === 0) return { label: "PAUSED", color: "default" };
  if (status === 1) return { label: "NEW", color: "default" };
  if (status === 8) return { label: "SEEMS DOWN", color: "warning" };
  if (status === 9) return { label: "DOWN", color: "error" };
  return { label: `STATUS ${status}`, color: "default" };
}

function getLastResponseMs(m: any): number | null {
  const rt = m?.response_times;
  if (!Array.isArray(rt) || rt.length === 0) return null;

  // UptimeRobot response_times obvykle: [{datetime: 171..., value: 123}, ...]
  const last = rt[rt.length - 1];
  const v = last?.value;
  const num = typeof v === "number" ? v : Number(v);
  return Number.isFinite(num) ? num : null;
}

function getRecentIncidents(m: any): any[] {
  // logs mohou být array objektů; často mají "type" + "datetime" + "duration" apod.
  const logs = m?.logs;
  if (!Array.isArray(logs)) return [];
  return logs.slice(0, 20);
}

function renderJson(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export default function OperationsStatusPanel() {
  const [data, setData] = useState<ApiStatusResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) throw new Error(`status api failed: ${res.status}`);
        const json = (await res.json()) as ApiStatusResp;
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

  const monitors = data?.monitors ?? [];

  const summary = useMemo(() => {
    const total = monitors.length;
    const up = monitors.filter((m: any) => m?.status === 2).length;
    const paused = monitors.filter((m: any) => m?.status === 0).length;
    const downish = monitors.filter((m: any) => m?.status !== 2 && m?.status !== 0).length;
    return { total, up, paused, downish };
  }, [monitors]);

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Loading UptimeRobot status…" />;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              UptimeRobot — Operations
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Detailed monitor status, uptime ratios (1/7/30/90), response time trend, incident logs.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Overall: ${data.overall ?? "unknown"}`}
              color={data.overall === "up" ? "success" : data.overall === "down" ? "error" : "default"}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Avg 30d: ${data.avg30d == null ? "—" : fmtPct(data.avg30d)}`}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip label={`Monitors: ${summary.total}`} size="small" variant="outlined" />
          <Chip label={`UP: ${summary.up}`} size="small" color="success" variant="outlined" />
          <Chip label={`PAUSED: ${summary.paused}`} size="small" variant="outlined" />
          <Chip
            label={`NOT OK: ${summary.downish}`}
            size="small"
            color={summary.downish > 0 ? "error" : "default"}
            variant="outlined"
          />
        </Stack>

        {summary.downish > 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Some monitors are not OK (DOWN / SEEMS DOWN / NEW). Expand items below for details.
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 2 }}>
            All non-paused monitors are UP.
          </Alert>
        )}

        {/* Monitors list */}
        <Box>
          {monitors
            .slice()
            .sort((a: any, b: any) => {
              // order: down first, then up, then paused
              const aBad = a?.status !== 2 && a?.status !== 0;
              const bBad = b?.status !== 2 && b?.status !== 0;
              if (aBad !== bBad) return aBad ? -1 : 1;
              if (a?.status !== b?.status) return (a?.status ?? 0) - (b?.status ?? 0);
              return String(a?.friendly_name ?? "").localeCompare(String(b?.friendly_name ?? ""));
            })
            .map((m: any) => {
              const st = monitorStatusLabel(Number(m?.status));
              const ratios = parseRatios(m?.custom_uptime_ratio);
              const uptime1 = ratios[0];
              const uptime7 = ratios[1];
              const uptime30 = ratios[2];
              const uptime90 = ratios[3];

              const lastRt = getLastResponseMs(m);
              const incidents = getRecentIncidents(m);

              return (
                <Accordion key={m?.id ?? `${m?.friendly_name}-${Math.random()}`} disableGutters sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: "100%" }}>
                      <Chip label={st.label} color={st.color} size="small" variant="outlined" />
                      <Typography sx={{ fontWeight: 800, flexGrow: 1 }}>
                        {m?.friendly_name ?? `monitor-${m?.id ?? "?"}`}
                      </Typography>

                      {/* compact metrics */}
                      <Chip
                        label={`30d: ${uptime30 == null ? "—" : fmtPct(uptime30)}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`RT: ${lastRt == null ? "—" : fmtMs(lastRt)}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {/* Left: metadata + uptime */}
                      <Grid item xs={12} md={6}>
                        <Typography sx={{ fontWeight: 900, mb: 1 }}>Monitor</Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                          <Chip label={`id: ${m?.id ?? "—"}`} size="small" variant="outlined" />
                          {m?.type != null && <Chip label={`type: ${m.type}`} size="small" variant="outlined" />}
                          {m?.interval != null && <Chip label={`interval: ${m.interval}s`} size="small" variant="outlined" />}
                        </Stack>

                        {m?.url && (
                          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                            URL: <span style={{ fontFamily: "monospace" }}>{m.url}</span>
                          </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography sx={{ fontWeight: 900, mb: 1 }}>Uptime ratios</Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip label={`1d: ${uptime1 == null ? "—" : fmtPct(uptime1)}`} size="small" variant="outlined" />
                          <Chip label={`7d: ${uptime7 == null ? "—" : fmtPct(uptime7)}`} size="small" variant="outlined" />
                          <Chip label={`30d: ${uptime30 == null ? "—" : fmtPct(uptime30)}`} size="small" variant="outlined" />
                          <Chip label={`90d: ${uptime90 == null ? "—" : fmtPct(uptime90)}`} size="small" variant="outlined" />
                          <Chip
                            label={`all-time: ${m?.all_time_uptime_ratio ? `${m.all_time_uptime_ratio}%` : "—"}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mt: 1 }}>
                          (Ratios come from UptimeRobot custom_uptime_ratios=1-7-30-90.)
                        </Typography>
                      </Grid>

                      {/* Right: response times + incidents */}
                      <Grid item xs={12} md={6}>
                        <Typography sx={{ fontWeight: 900, mb: 1 }}>Response time</Typography>

                        {Array.isArray(m?.response_times) && m.response_times.length ? (
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
                              maxHeight: 200,
                              fontSize: 12,
                            }}
                          >
                            {renderJson(m.response_times)}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            No response_times returned (check API params or monitor type).
                          </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography sx={{ fontWeight: 900, mb: 1 }}>Incident logs</Typography>

                        {incidents.length ? (
                          <ListIncidents incidents={incidents} />
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            No logs returned.
                          </Typography>
                        )}
                      </Grid>

                      {/* Bottom: raw (optional) */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography sx={{ fontWeight: 900, mb: 1 }}>Raw monitor payload</Typography>
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
                            maxHeight: 320,
                            fontSize: 12,
                          }}
                        >
                          {renderJson(m)}
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
        </Box>

        {/* Optional: raw whole response */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Tip: If you want a response-time chart, we can render a small SVG sparkline from response_times.
        </Typography>
      </CardContent>
    </Card>
  );
}

function ListIncidents({ incidents }: { incidents: any[] }) {
  // Logs shape varies; we render robustly.
  // Typical fields: type, datetime, duration, reason/description
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ bgcolor: "background.paper", p: 1.5 }}>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Latest {Math.min(incidents.length, 20)} events
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ maxHeight: 220, overflow: "auto" }}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {incidents.map((x, idx) => (
            <Box
              key={idx}
              component="li"
              sx={{
                p: 1.5,
                borderBottom: idx === incidents.length - 1 ? "none" : "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {x?.type != null && (
                  <Chip
                    label={`type: ${x.type}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {x?.datetime != null && (
                  <Chip
                    label={fmtUnix(x.datetime)}
                    size="small"
                    variant="outlined"
                  />
                )}
                {x?.duration != null && (
                  <Chip
                    label={`duration: ${x.duration}s`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  mt: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "auto",
                  fontSize: 12,
                }}
              >
                {renderJson(x)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}