"use client";

import { Card, CardContent, Typography } from "@mui/material";

export default function Roadmap({ roadmap }: any) {
  return (
    <>
      {roadmap.epics?.map((e: any) => (
        <Card key={e.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{e.id}</Typography>
            <Typography>{e.name}</Typography>
            <Typography variant="body2">
              Capabilities: {e.capabilities?.length}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
}