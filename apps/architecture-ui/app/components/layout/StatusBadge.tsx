"use client";

import { Chip, Tooltip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

type StatusResp = {
  overall?: "up" | "down";
  monitors?: Array<{ id: number; friendly_name: string; status: number }>;
};

function computeLabel(data: StatusResp | null) {
  if (!data?.overall) return "Status: unknown";
  return data.overall === "up" ? "Status: UP" : "Status: DOWN";
}

export default function StatusBadge() {
  const [data, setData] = useState<StatusResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const tooltip = useMemo(() => {
    if (err) return err;
    const mons = data?.monitors ?? [];
    if (!mons.length) return "No monitors";
    return mons
      .map((m) => `${m.friendly_name}: ${m.status === 2 ? "UP" : m.status === 0 ? "PAUSED" : "DOWN"}`)
      .join("\n");
  }, [data, err]);

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
    const t = setInterval(load, 60_000); // refresh each 60s
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const label = computeLabel(data);
  const color =
    data?.overall === "up" ? "success" : data?.overall === "down" ? "error" : "default";

  return (
    <Tooltip title={<pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{tooltip}</pre>}>
      <Chip size="small" label={label} color={color as any} variant="outlined" />
    </Tooltip>
  );
}