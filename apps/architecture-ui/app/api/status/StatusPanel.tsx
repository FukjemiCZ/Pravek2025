"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function StatusPanel() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading status…</div>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">System Status</Typography>
        {data.monitors?.map((m: any) => (
          <div key={m.id}>
            {m.friendly_name} — {m.status === 2 ? "🟢 Up" : "🔴 Down"}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}