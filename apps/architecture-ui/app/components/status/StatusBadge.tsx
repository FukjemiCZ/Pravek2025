"use client";

import { Chip } from "@mui/material";
import { useEffect, useState } from "react";

export default function StatusBadge() {
  const [status, setStatus] = useState<"up" | "down" | "unknown">("unknown");

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => {
        const monitors = data.monitors || [];
        const isDown = monitors.some((m: any) => m.status !== 2);
        setStatus(isDown ? "down" : "up");
      })
      .catch(() => setStatus("unknown"));
  }, []);

  const color =
    status === "up"
      ? "success"
      : status === "down"
      ? "error"
      : "default";

  return <Chip label={`Status: ${status}`} color={color} size="small" />;
}