"use client";

import { Chip, Stack, Typography } from "@mui/material";

export default function EventsSection({ events }: any) {
  return (
    <>
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Events
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {events?.map((e: any) => (
          <Chip key={e.id} label={e.id} />
        ))}
      </Stack>
    </>
  );
}