"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

export default function RuntimeSummary({ runtime }: { runtime: any }) {
  const flags = runtime?.featureFlags ?? {};
  const years = runtime?.years ?? [];

  const entries = Object.entries(flags).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <SectionCard title="Runtime" subtitle="Feature flags + years + key runtime controls">
      <Typography sx={{ fontWeight: 800, mb: 1 }}>Feature Flags</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {entries.length ? (
          entries.map(([k, v]) => (
            <Chip
              key={k}
              label={`${k}: ${v ? "ON" : "OFF"}`}
              color={v ? "success" : "default"}
              variant="outlined"
              size="small"
            />
          ))
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            No feature flags
          </Typography>
        )}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>Years</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {(years ?? []).map((y: any) => (
            <Chip
              key={y.id}
              label={`${y.id}${y.status ? ` (${y.status})` : ""}`}
              variant="outlined"
              size="small"
            />
          ))}
          {!years?.length && (
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              No years configured
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Optional: external endpoints */}
      {runtime?.externalEndpoints && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>External Endpoints</Typography>
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
            {JSON.stringify(runtime.externalEndpoints, null, 2)}
          </Box>
        </Box>
      )}
    </SectionCard>
  );
}