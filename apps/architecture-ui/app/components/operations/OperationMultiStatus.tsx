"use client";

import { useEffect, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";
import OperationsStatusPanel from "@/app/components/operations/OperationsStatusPanel"; // tvůj detail pro UptimeRobot

type Provider = "uptimerobot" | "uptimekuma" | "site24x7";

function ProviderPanel({ provider }: { provider: Provider }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        setData(null);

        const url =
          provider === "uptimerobot"
            ? "/api/status"
            : provider === "uptimekuma"
            ? "/api/status/uptimekuma"
            : "/api/status/site24x7";

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`${provider} failed: ${res.status}`);
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
  }, [provider]);

  if (provider === "uptimerobot") {
    // reuse tvůj detailní panel (on si fetchuje sám)
    return <OperationsStatusPanel />;
  }

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label={`Loading ${provider}…`} />;

  // jednoduchý univerzální render pro Kuma + Site24x7
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
        {provider === "uptimekuma" ? "Uptime Kuma" : "Site24x7"} — Overview
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
        Overall: {data.overall ?? "unknown"} · Monitors: {data.summary?.total ?? 0}
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
          maxHeight: 520,
          fontSize: 12,
        }}
      >
        {JSON.stringify(data.monitors ?? [], null, 2)}
      </Box>
    </Box>
  );
}

export default function OperationsMultiStatus() {
  const [tab, setTab] = useState<Provider>("uptimerobot");

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab value="uptimerobot" label="UptimeRobot" />
        <Tab value="uptimekuma" label="Uptime Kuma" />
        <Tab value="site24x7" label="Site24x7" />
      </Tabs>

      <ProviderPanel provider={tab} />
    </Box>
  );
}