"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useParams } from "next/navigation";

type Checkpoint = {
  id: string;
  name: string;
  order: number;
  distanceKm: number;
};

type Race = {
  id: string;
  name: string;
  year: number;
};

type Passage = {
  id: string;
  createdAt: string;
  racer: {
    id: string;
    startNumber?: string | null;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
    state?: {
      status: string;
      lastCheckpointKm?: number | null;
      lastActivityAt?: string | null;
    } | null;
  } | null;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

export default function CheckpointBoardPage() {
  const params = useParams<{ id: string }>();
  const checkpointId = params.id;

  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [race, setRace] = useState<Race | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function load() {
    const response = await fetch(`/api/admin/checkpoint/${checkpointId}/board`, { cache: "no-store" });

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      setError("Nepodařilo se načíst checkpoint board.");
      return;
    }

    const json = await response.json();
    setCheckpoint(json.checkpoint);
    setRace(json.race);
    setPassages(json.passages || []);
    setLastRefresh(new Date());
  }

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 10000);
    return () => window.clearInterval(interval);
  }, [checkpointId]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 3 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight={900}>{checkpoint?.name || "Checkpoint"}</Typography>
                  <Typography variant="h6" color="text.secondary">
                    {race ? `${race.name} (${race.year})` : "Závod"} · {checkpoint?.distanceKm ?? 0} km
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button href="/admin/checkpoints" variant="outlined">Checkpointy</Button>
                  <Button href={`/admin/checkpoint/${checkpointId}/checkin`} variant="contained">Check-in</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="overline">Počet průchodů</Typography>
                <Typography variant="h2" fontWeight={900}>{passages.length}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="overline">Poslední refresh</Typography>
                <Typography variant="h4" fontWeight={900}>{lastRefresh ? formatTime(lastRefresh.toISOString()) : "—"}</Typography>
              </CardContent>
            </Card>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Čas</TableCell>
                  <TableCell>Číslo</TableCell>
                  <TableCell>Závodník</TableCell>
                  <TableCell>Kontakt</TableCell>
                  <TableCell>Stav</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {passages.map((passage) => (
                  <TableRow key={passage.id} hover>
                    <TableCell>
                      <Typography fontWeight={900}>{formatTime(passage.createdAt)}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDateTime(passage.createdAt)}</Typography>
                    </TableCell>
                    <TableCell><Chip label={passage.racer?.startNumber || "—"} /></TableCell>
                    <TableCell>
                      <Typography fontWeight={800}>{passage.racer ? `${passage.racer.firstName} ${passage.racer.lastName}` : "Neznámý závodník"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{passage.racer?.phone || "—"}</Typography>
                      <Typography variant="body2" color="text.secondary">{passage.racer?.email || "—"}</Typography>
                    </TableCell>
                    <TableCell><Chip size="small" label={passage.racer?.state?.status || "—"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {passages.length === 0 && <Alert severity="info">Zatím zde není žádný průchod.</Alert>}
        </Stack>
      </Container>
    </Box>
  );
}
