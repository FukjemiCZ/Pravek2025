"use client";

import { Card, CardContent, Typography, Chip, Stack } from "@mui/material";

export default function RuntimePanel({ runtime }: any) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Runtime</Typography>

        <Typography sx={{ mt: 2 }}>Feature Flags</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Object.entries(runtime.featureFlags || {}).map(([k, v]) => (
            <Chip
              key={k}
              label={`${k}: ${v ? "ON" : "OFF"}`}
              color={v ? "success" : "default"}
            />
          ))}
        </Stack>

        <Typography sx={{ mt: 2 }}>Years</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {runtime.years?.map((y: any) => (
            <Chip key={y.id} label={y.id} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}