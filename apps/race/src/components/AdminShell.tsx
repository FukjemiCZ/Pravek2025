"use client";

import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>{title}</Typography>
          <Button color="inherit" href="/admin">Dashboard</Button>
          <Button color="inherit" href="/admin/racers">Závodníci</Button>
          <Button color="inherit" href="/admin/checkpoints">Checkpointy</Button>
          <Button color="inherit" href="/admin/incidents">Incidenty</Button>
          <Button color="inherit" href="/admin/exports">Exporty</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>{children}</Stack>
      </Container>
    </Box>
  );
}
