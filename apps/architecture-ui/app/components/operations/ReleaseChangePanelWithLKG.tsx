"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";
import ReleaseChangePanel from "@/app/components/operations/ReleaseChangePanel";
import ImpactMapPanel from "./ImpactMapPanel";

function shortSha(s?: string | null) {
  if (!s) return "—";
  return s.slice(0, 7);
}

export default function ReleaseChangePanelWithLKG() {
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
    const t = setInterval(load, 120_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const { baseSha, headSha, warnings } = useMemo(() => {
    const warnings: string[] = [];

    const web = data?.vercel?.web ?? {};
    const deployments: any[] = Array.isArray(web?.deployments) ? web.deployments : [];

    // newest production READY = HEAD
    const head = deployments.find(
      (d) => d?.target === "production" && d?.state === "READY" && d?.ghCommitSha
    );
    const headSha = head?.ghCommitSha ?? null;

    // paired LKG production READY + GH success = BASE
    const base = web?.lastKnownGoodPaired?.production ?? null;
    const baseSha = base?.meta?.githubCommitSha
      ? String(base.meta.githubCommitSha).toLowerCase()
      : base?.ghCommitSha ?? null;

    if (!headSha) warnings.push("No current WEB production READY deployment with githubCommitSha found.");
    if (!baseSha) warnings.push("No paired Last Known Good (production READY + GH success) found.");

    // fallback: if no paired baseSha, use any production READY as base (older than head)
    let finalBase = baseSha;
    if (!finalBase && headSha) {
      const olderReady = deployments.find(
        (d) =>
          d?.target === "production" &&
          d?.state === "READY" &&
          d?.ghCommitSha &&
          d.ghCommitSha !== headSha
      );
      if (olderReady?.ghCommitSha) {
        finalBase = olderReady.ghCommitSha;
        warnings.push("Using fallback base: previous production READY (not paired with GH success).");
      }
    }

    return { baseSha: finalBase, headSha, warnings };
  }, [data]);

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Loading deployments for LKG compare…" />;

  if (!baseSha || !headSha) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          Release & Change — Since Last Known Good (WEB prod)
        </Typography>
        {warnings.map((w, i) => (
          <Alert key={i} severity="warning" sx={{ mb: 1 }}>
            {w}
          </Alert>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {warnings.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {warnings.map((w, i) => (
            <Alert key={i} severity="info" sx={{ mb: 1 }}>
              {w}
            </Alert>
          ))}
        </Box>
      )}

      <Alert severity="success" sx={{ mb: 2 }}>
        Comparing WEB prod changes: <b>{shortSha(baseSha)}</b> → <b>{shortSha(headSha)}</b>
      </Alert>

      <ReleaseChangePanel baseSha={baseSha} headSha={headSha} />
      <ImpactMapPanel baseSha={baseSha} headSha={headSha} />
    </Box>
  );
}