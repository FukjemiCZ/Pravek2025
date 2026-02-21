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
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";

function fmtTime(msOrIso: any) {
  if (!msOrIso) return "—";
  const d =
    typeof msOrIso === "number"
      ? new Date(msOrIso)
      : new Date(String(msOrIso));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().replace("T", " ").replace("Z", " UTC");
}

function vercelStateChip(state?: string) {
  if (state === "READY") return <Chip size="small" label="READY" color="success" variant="outlined" />;
  if (state === "ERROR") return <Chip size="small" label="ERROR" color="error" variant="outlined" />;
  if (state) return <Chip size="small" label={state} variant="outlined" />;
  return <Chip size="small" label="—" variant="outlined" />;
}

function ghRunChip(conclusion?: string) {
  if (conclusion === "success") return <Chip size="small" label="success" color="success" variant="outlined" />;
  if (conclusion === "failure") return <Chip size="small" label="failure" color="error" variant="outlined" />;
  if (conclusion === "cancelled") return <Chip size="small" label="cancelled" variant="outlined" />;
  if (conclusion) return <Chip size="small" label={conclusion} variant="outlined" />;
  return <Chip size="small" label="running" color="warning" variant="outlined" />;
}

export default function DeploymentFeed() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        const res = await fetch("/api/deployments", { cache: "no-store" });
        if (!res.ok) throw new Error(`deployments api failed: ${res.status}`);
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

  const ghRuns = data?.github?.runs ?? [];
  const web = data?.vercel?.web ?? {};
  const arch = data?.vercel?.architectureUi ?? {};

  const lkg = useMemo(() => {
    return {
      webProd: web?.lastKnownGood?.production ?? null,
      archProd: arch?.lastKnownGood?.production ?? null,
    };
  }, [web, arch]);

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Loading deployments & workflow runs…" />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Deployment feed & Last known good
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
          Vercel deployments + GitHub Actions workflow runs.
        </Typography>

        <Grid container spacing={2}>
          {/* Last known good */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Last known good (Production)</Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Alert severity={lkg.webProd ? "success" : "warning"}>
                <b>WEB</b> — {lkg.webProd?.url ? (
                  <>
                    <Link href={`https://${lkg.webProd.url}`} target="_blank" rel="noreferrer">
                      https://{lkg.webProd.url}
                    </Link>{" "}
                    · {fmtTime(lkg.webProd?.createdAt)}
                  </>
                ) : "Not found"}
              </Alert>

              <Alert severity={lkg.archProd ? "success" : "warning"}>
                <b>ARCH UI</b> — {lkg.archProd?.url ? (
                  <>
                    <Link href={`https://${lkg.archProd.url}`} target="_blank" rel="noreferrer">
                      https://{lkg.archProd.url}
                    </Link>{" "}
                    · {fmtTime(lkg.archProd?.createdAt)}
                  </>
                ) : "Not found"}
              </Alert>
            </Box>
          </Grid>

          {/* GitHub runs */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>GitHub Actions (latest)</Typography>
            <List dense sx={{ maxHeight: 220, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              {ghRuns.slice(0, 10).map((r: any) => (
                <ListItem key={r.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {ghRunChip(r.conclusion)}
                        <Typography sx={{ fontWeight: 700 }}>
                          {r.name ?? "workflow"}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                          {r.head_branch} · {r.head_sha?.slice(0, 7)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      r.html_url ? (
                        <Link href={r.html_url} target="_blank" rel="noreferrer">
                          Open run · {fmtTime(r.run_started_at)}
                        </Link>
                      ) : fmtTime(r.run_started_at)
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Vercel feeds */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Vercel — WEB deployments</Typography>
            <DeployList deployments={web?.deployments ?? []} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Vercel — ARCH UI deployments</Typography>
            <DeployList deployments={arch?.deployments ?? []} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function DeployList({ deployments }: { deployments: any[] }) {
  return (
    <List dense sx={{ maxHeight: 260, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      {(deployments ?? []).slice(0, 12).map((d: any) => (
        <ListItem key={d.uid ?? d.id} divider>
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {vercelStateChip(d.state)}
                <Chip size="small" variant="outlined" label={d.target ?? "preview"} />
                <Typography sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                  {String(d?.meta?.githubCommitSha ?? d?.meta?.commitSha ?? "").slice(0, 7) || "—"}
                </Typography>
              </Box>
            }
            secondary={
              d.url ? (
                <Link href={`https://${d.url}`} target="_blank" rel="noreferrer">
                  https://{d.url}
                </Link>
              ) : "url pending"
            }
          />
        </ListItem>
      ))}
    </List>
  );
}