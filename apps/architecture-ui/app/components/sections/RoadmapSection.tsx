"use client";

import { Card, CardContent, Typography } from "@mui/material";

export default function RoadmapSection({ roadmap }: any) {
  return (
    <>
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Roadmap
      </Typography>

      {roadmap?.epics?.map((e: any) => (
        <Card key={e.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{e.id}</Typography>
            <Typography variant="body2">
              Year: {e.year}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
}