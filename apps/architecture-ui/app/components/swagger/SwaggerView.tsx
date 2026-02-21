"use client";

import { Box, Typography } from "@mui/material";

export default function SwaggerView() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Web API Docs
      </Typography>

      <Box
        sx={{
          height: "calc(100vh - 220px)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <iframe
          title="swagger"
          src="/api/swagger"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </Box>
    </Box>
  );
}