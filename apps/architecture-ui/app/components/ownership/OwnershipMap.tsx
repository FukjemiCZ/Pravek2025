"use client";

import { Card, CardContent, Typography } from "@mui/material";

export default function OwnershipMap({ ownership }: any) {
  return (
    <>
      {ownership.teams?.map((t: any) => (
        <Card key={t.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{t.id}</Typography>
            <Typography>
              Domains: {t.domains?.join(", ") || "-"}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
}