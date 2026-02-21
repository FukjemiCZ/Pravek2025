"use client";

import { Card, CardContent, Typography } from "@mui/material";

export default function CapabilitiesSection({ capabilities }: any) {
  return (
    <>
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Capabilities
      </Typography>

      {capabilities?.map((c: any) => (
        <Card key={c.id} sx={{ mb: 1 }}>
          <CardContent>
            <Typography variant="subtitle1">{c.id}</Typography>
            <Typography variant="body2" color="text.secondary">
              Domain: {c.domain}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
}