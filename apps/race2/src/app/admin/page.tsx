"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, AppBar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Tab, Tabs, TextField, Toolbar, Typography } from "@mui/material";

type Race = { id: string; name: string; year: number };
type Checkpoint = { id: string; name: string; order: number; distanceKm: number };
type Racer = { id: string; startNumber?: string; firstName: string; lastName: string; phone?: string; email?: string; publicAccessToken: string; state?: { status: string; lastCheckpointKm?: number; currentSegmentFrom?: string; currentSegmentTo?: string; photoCount: number; lastActivityAt?: string } };

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [races, setRaces] = useState<Race[]>([]);
  const [raceId, setRaceId] = useState("");
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const activeRace = useMemo(() => races.find((r) => r.id === raceId), [races, raceId]);

  async function load() {
    const me = await fetch("/api/admin/me");
    if (me.status === 401) { window.location.href = "/login"; return; }
    const racesRes = await fetch("/api/admin/races");
    const racesJson = await racesRes.json();
    const loadedRaces = racesJson.races || [];
    setRaces(loadedRaces);
    const selectedRace = raceId || loadedRaces[0]?.id || "";
    setRaceId(selectedRace);
    if (selectedRace) {
      const dashboard = await fetch(`/api/admin/dashboard?raceId=${selectedRace}`);
      const json = await dashboard.json();
      setRacers(json.racers || []);
      setCheckpoints(json.checkpoints || []);
    }
  }

  useEffect(() => { load().catch(() => setError("Nepodařilo se načíst administraci.")); }, []);
  useEffect(() => { if (raceId) load().catch(() => setError("Nepodařilo se načíst data závodu.")); }, [raceId]);

  return (
    <Box>
      <AppBar position="sticky"><Toolbar><Typography variant="h6" sx={{ flex: 1 }}>Pravěk Race Admin</Typography><Button color="inherit" onClick={async () => { await fetch("/api/admin/auth/logout", { method: "POST" }); window.location.href = "/login"; }}>Odhlásit</Button></Toolbar></AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Typography variant="h4" fontWeight={900} sx={{ flex: 1 }}>Administrace závodu</Typography>
            <FormControl sx={{ minWidth: 280 }}><InputLabel>Závod</InputLabel><Select label="Závod" value={raceId} onChange={(e) => setRaceId(e.target.value)}>{races.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}</Select></FormControl>
          </Stack>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable"><Tab label="Dashboard" /><Tab label="Checkpointy" /><Tab label="Import" /><Tab label="SMS" /></Tabs>
          {tab === 0 && <Dashboard racers={racers} checkpoints={checkpoints} />}
          {tab === 1 && <CheckpointManager raceId={raceId} checkpoints={checkpoints} reload={load} />}
          {tab === 2 && activeRace && <ImportPanel race={activeRace} reload={load} />}
          {tab === 3 && <SmsPanel raceId={raceId} checkpoints={checkpoints} />}
        </Stack>
      </Container>
    </Box>
  );
}

function Dashboard({ racers, checkpoints }: { racers: Racer[]; checkpoints: Checkpoint[] }) {
  return <Grid container spacing={2}>{racers.map((r) => <Grid item xs={12} md={6} lg={4} key={r.id}><Card><CardContent><Stack spacing={1}><Stack direction="row" spacing={1} alignItems="center"><Chip label={r.startNumber || "bez čísla"} /><Typography fontWeight={800}>{r.firstName} {r.lastName}</Typography></Stack><Typography color="text.secondary">{r.phone || "bez telefonu"} · {r.email || "bez e-mailu"}</Typography><Typography>Stav: <b>{r.state?.status || "NOT_STARTED"}</b></Typography><Typography>Km: {r.state?.lastCheckpointKm ?? 0} · Fotky: {r.state?.photoCount ?? 0}</Typography><Typography variant="caption">Token: /r/{r.publicAccessToken}</Typography></Stack></CardContent></Card></Grid>)}</Grid>;
}

function CheckpointManager({ raceId, checkpoints, reload }: { raceId: string; checkpoints: Checkpoint[]; reload: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  async function add() { await fetch("/api/admin/checkpoints", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raceId, name, order, distanceKm }) }); setName(""); await reload(); }
  return <Stack spacing={2}><Card><CardContent><Stack direction={{ xs: "column", md: "row" }} spacing={2}><TextField label="Název" value={name} onChange={(e) => setName(e.target.value)} /><TextField label="Pořadí" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} /><TextField label="Km od startu" type="number" value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} /><Button variant="contained" onClick={add}>Přidat</Button></Stack></CardContent></Card>{checkpoints.map((cp) => <Card key={cp.id}><CardContent><Typography fontWeight={800}>{cp.order}. {cp.name}</Typography><Typography>{cp.distanceKm} km od startu</Typography></CardContent></Card>)}</Stack>;
}

function ImportPanel({ race, reload }: { race: Race; reload: () => Promise<void> }) {
  const [paid, setPaid] = useState("all");
  const [confirmed, setConfirmed] = useState("all");
  const [rows, setRows] = useState<any[]>([]);
  async function preview() { const res = await fetch("/api/admin/import/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raceId: race.id, year: race.year, paid, confirmed, dedupMode: "email_or_phone", hideImported: false }) }); setRows((await res.json()).rows || []); }
  async function confirm() { await fetch("/api/admin/import/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raceId: race.id, year: race.year, paid, confirmed, dedupMode: "email_or_phone" }) }); await reload(); }
  return <Stack spacing={2}><Card><CardContent><Stack direction={{ xs: "column", md: "row" }} spacing={2}><FormControl><InputLabel>Zaplaceno</InputLabel><Select label="Zaplaceno" value={paid} onChange={(e) => setPaid(e.target.value)}><MenuItem value="all">vše</MenuItem><MenuItem value="yes">ano</MenuItem><MenuItem value="no">ne</MenuItem></Select></FormControl><FormControl><InputLabel>Potvrzeno</InputLabel><Select label="Potvrzeno" value={confirmed} onChange={(e) => setConfirmed(e.target.value)}><MenuItem value="all">vše</MenuItem><MenuItem value="yes">ano</MenuItem><MenuItem value="no">ne</MenuItem></Select></FormControl><Button variant="outlined" onClick={preview}>Preview</Button><Button variant="contained" onClick={confirm}>Importovat nové</Button></Stack></CardContent></Card>{rows.map((row) => <Card key={row.sourceKey}><CardContent><Stack direction="row" spacing={1}><Chip color={row.duplicate ? "warning" : "success"} label={row.duplicate ? "duplicitní" : "nový"} /><Typography>{row.firstName} {row.lastName} · {row.email} · {row.phone}</Typography></Stack></CardContent></Card>)}</Stack>;
}

function SmsPanel({ raceId, checkpoints }: { raceId: string; checkpoints: Checkpoint[] }) {
  const [body, setBody] = useState("");
  const [segmentFrom, setSegmentFrom] = useState("");
  const [segmentTo, setSegmentTo] = useState("");
  const [preview, setPreview] = useState<number | null>(null);
  async function previewSms() { const res = await fetch("/api/admin/sms/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raceId, segmentFrom: segmentFrom || undefined, segmentTo: segmentTo || undefined }) }); setPreview((await res.json()).count || 0); }
  async function send() { await fetch("/api/admin/sms/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raceId, body, segmentFrom: segmentFrom || undefined, segmentTo: segmentTo || undefined }) }); setBody(""); }
  return <Card><CardContent><Stack spacing={2}><Typography variant="h6">SMS podle úseku trasy</Typography><Stack direction={{ xs: "column", md: "row" }} spacing={2}><FormControl fullWidth><InputLabel>Od checkpointu</InputLabel><Select label="Od checkpointu" value={segmentFrom} onChange={(e) => setSegmentFrom(e.target.value)}><MenuItem value="">nerozlišovat</MenuItem>{checkpoints.map((cp) => <MenuItem key={cp.id} value={cp.id}>{cp.name}</MenuItem>)}</Select></FormControl><FormControl fullWidth><InputLabel>Do checkpointu</InputLabel><Select label="Do checkpointu" value={segmentTo} onChange={(e) => setSegmentTo(e.target.value)}><MenuItem value="">nerozlišovat</MenuItem>{checkpoints.map((cp) => <MenuItem key={cp.id} value={cp.id}>{cp.name}</MenuItem>)}</Select></FormControl></Stack><TextField multiline minRows={4} label="Text SMS" value={body} onChange={(e) => setBody(e.target.value)} /><Stack direction="row" spacing={2}><Button variant="outlined" onClick={previewSms}>Spočítat příjemce</Button><Button variant="contained" onClick={send} disabled={!body}>Odeslat</Button></Stack>{preview !== null && <Alert severity="info">Počet příjemců: {preview}</Alert>}</Stack></CardContent></Card>;
}
