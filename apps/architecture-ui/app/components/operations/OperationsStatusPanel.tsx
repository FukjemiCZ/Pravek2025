"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";

type StatusResp = {
  overall?: "up" | "down";
  monitors?: Array<{ id: number; friendly_name: string; status: number }>;
};

export default function OperationsStatusPanel() {
  const [data, setData] = useState<StatusResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) throw new Error(`status api failed: ${res.status}`);
        const json = (await res.json()) as StatusResp;
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

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Loading status…" />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          UptimeRobot Status
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
          Overall: {data.overall ?? "unknown"}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {(data.monitors ?? []).map((m) => {
            const label =
              m.status === 2 ? "UP" : m.status === 0 ? "PAUSED" : "DOWN";
            const color =
              m.status === 2 ? "success" : m.status === 0 ? "default" : "error";

            return (
              <Chip
                key={m.id}
                label={`${m.friendly_name}: ${label}`}
                color={color as any}
                variant="outlined"
                size="small"
              />
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}