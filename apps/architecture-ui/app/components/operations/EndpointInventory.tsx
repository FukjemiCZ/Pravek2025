"use client";

import { Box, Typography } from "@mui/material";
import SectionCard from "@/app/components/shared/SectionCard";

export default function EndpointInventory({ runtime }: { runtime: any }) {
  const endpoints = runtime?.externalEndpoints ?? null;

  return (
    <SectionCard title="Endpoint inventory" subtitle="External endpoints + integrations (runtime)">
      {!endpoints ? (
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          No externalEndpoints in runtime.json
        </Typography>
      ) : (
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
          {JSON.stringify(endpoints, null, 2)}
        </Box>
      )}
    </SectionCard>
  );
}