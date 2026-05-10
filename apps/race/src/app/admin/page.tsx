"use client";
import { useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { AdminShell } from "@/components/AdminShell";

type Race = { id: string; name: string; year: number };
type Racer = { id: string; firstName: string; lastName: string; startNumber?: string; state?: { status: string; lastCheckpointKm?: number } };
type Incident = { id: string; title: string; severity: string; status: string; racer?: { firstName: string; lastName: string } | null };

export default function AdminPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [raceId, setRaceId] = useState("");
  const [racers, setRacers] = useState<Racer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const me = await fetch("/api/admin/me");
    if (me.status === 401) { window.location.href = "/login"; return; }
    const racesJson = await (await fetch("/api/admin/races")).json();
    const loadedRaces = racesJson.races || [];
    const selectedRaceId = raceId || loadedRaces[0]?.id || "";
    setRaces(loadedRaces);
    setRaceId(selectedRaceId);
    if (selectedRaceId) {
      const dashboard = await (await fetch(`/api/admin/dashboard?raceId=${selectedRaceId}`)).json();
      setRacers(dashboard.racers || []);
      setIncidents(dashboard.incidents || []);
    }
  }

  useEffect(() => { load().catch(() => setError("Nepodařilo se načíst dashboard.")); }, []);
  useEffect(() => { if (raceId) load(); }, [raceId]);

  return <AdminShell title="Pravěk Race Admin">
    {error && <Alert severity="error">{error}</Alert>}
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Button variant="contained" href="/admin/racers">Závodníci</Button>
      <Button variant="contained" href="/admin/checkpoints">Checkpointy</Button>
      <Button variant="contained" href="/admin/incidents">Incidenty</Button>
      <Button variant="contained" href="/admin/exports">Exporty</Button>
      <Button variant="outlined" href="/live">Veřejný live board</Button>
    </Stack>
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}><Card><CardContent><Typography variant="overline">Závodníci</Typography><Typography variant="h3">{racers.length}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={3}><Card><CardContent><Typography variant="overline">Na trase</Typography><Typography variant="h3">{racers.filter(r => r.state?.status === "ON_ROUTE").length}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={3}><Card><CardContent><Typography variant="overline">V cíli</Typography><Typography variant="h3">{racers.filter(r => r.state?.status === "FINISHED").length}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={3}><Card><CardContent><Typography variant="overline">Incidenty</Typography><Typography variant="h3">{incidents.length}</Typography></CardContent></Card></Grid>
    </Grid>
    <Typography variant="h5" fontWeight={900}>Aktivní incidenty</Typography>
    {incidents.length === 0 && <Alert severity="success">Žádné aktivní incidenty.</Alert>}
    {incidents.map(i => <Card key={i.id}><CardContent><Stack direction="row" spacing={1} alignItems="center"><Chip color={i.severity === "CRITICAL" ? "error" : "warning"} label={i.severity} /><Typography fontWeight={800}>{i.title}</Typography><Typography>{i.racer ? `${i.racer.firstName} ${i.racer.lastName}` : ""}</Typography></Stack></CardContent></Card>)}
  </AdminShell>;
}
