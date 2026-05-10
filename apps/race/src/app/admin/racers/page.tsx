"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, AppBar, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type Race = { id: string; name: string; year: number };
type RacerState = { status: string; lastCheckpointKm?: number | null; photoCount?: number; lastActivityAt?: string | null };
type Racer = {
  id: string;
  raceId: string;
  startNumber?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  routeName?: string | null;
  paymentStatus?: string | null;
  registrationStatus?: string | null;
  dog1Name?: string | null;
  dog1BirthDate?: string | null;
  dog1Breed?: string | null;
  dog2Name?: string | null;
  dog2BirthDate?: string | null;
  dog2Breed?: string | null;
  dog3Name?: string | null;
  dog3BirthDate?: string | null;
  dog3Breed?: string | null;
  publicAccessToken: string;
  state?: RacerState | null;
};

type TimelineItem = { id: string; type: string; checkpoint: string | null; checkpointKm: number | null; createdAt: string; payload?: unknown };

const editableFields: Array<{ key: keyof Racer; label: string }> = [
  { key: "startNumber", label: "Startovní číslo" },
  { key: "firstName", label: "Jméno" },
  { key: "lastName", label: "Příjmení" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefon" },
  { key: "routeName", label: "Trasa" },
  { key: "paymentStatus", label: "Platba" },
  { key: "registrationStatus", label: "Stav registrace" },
  { key: "dog1Name", label: "Jméno 1. psa" },
  { key: "dog1BirthDate", label: "Datum narození 1. psa" },
  { key: "dog1Breed", label: "Plemeno 1. psa" },
  { key: "dog2Name", label: "Jméno 2. psa" },
  { key: "dog2BirthDate", label: "Datum narození 2. psa" },
  { key: "dog2Breed", label: "Plemeno 2. psa" },
  { key: "dog3Name", label: "Jméno 3. psa" },
  { key: "dog3BirthDate", label: "Datum narození 3. psa" },
  { key: "dog3Breed", label: "Plemeno 3. psa" }
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function racerName(racer: Racer) {
  return `${racer.firstName} ${racer.lastName}`.trim();
}

export default function RacersPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [raceId, setRaceId] = useState("");
  const [racers, setRacers] = useState<Racer[]>([]);
  const [query, setQuery] = useState("");
  const [editRacer, setEditRacer] = useState<Racer | null>(null);
  const [deleteRacer, setDeleteRacer] = useState<Racer | null>(null);
  const [timelineRacer, setTimelineRacer] = useState<Racer | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return racers;
    return racers.filter((racer) => [racer.startNumber, racer.firstName, racer.lastName, racer.email, racer.phone, racer.routeName].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [racers, query]);

  async function ensureLoggedIn() {
    const me = await fetch("/api/admin/me");
    if (me.status === 401) window.location.href = "/login";
  }

  async function loadRaces() {
    const response = await fetch("/api/admin/races");
    const json = await response.json();
    const loaded = json.races || [];
    setRaces(loaded);
    setRaceId((current) => current || loaded[0]?.id || "");
  }

  async function loadRacers(selectedRaceId = raceId) {
    if (!selectedRaceId) return;
    const response = await fetch(`/api/admin/racers?raceId=${selectedRaceId}`);
    const json = await response.json();
    setRacers(json.racers || []);
  }

  useEffect(() => {
    ensureLoggedIn().then(loadRaces).catch(() => setError("Nepodařilo se načíst administraci."));
  }, []);

  useEffect(() => {
    if (raceId) loadRacers(raceId).catch(() => setError("Nepodařilo se načíst závodníky."));
  }, [raceId]);

  async function saveRacer() {
    if (!editRacer) return;
    setSaving(true);
    const response = await fetch(`/api/admin/racers/${editRacer.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(editRacer)
    });
    setSaving(false);
    if (!response.ok) {
      setError("Uložení závodníka selhalo.");
      return;
    }
    setEditRacer(null);
    await loadRacers();
  }

  async function removeRacer() {
    if (!deleteRacer) return;
    const response = await fetch(`/api/admin/racers/${deleteRacer.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Smazání závodníka selhalo.");
      return;
    }
    setDeleteRacer(null);
    await loadRacers();
  }

  async function openTimeline(racer: Racer) {
    setTimelineRacer(racer);
    setTimeline([]);
    const response = await fetch(`/api/admin/racers/${racer.id}/timeline`);
    const json = await response.json();
    setTimeline(json.timeline || []);
  }

  function copyRacerLink(racer: Racer) {
    const href = `${window.location.origin}/r/${racer.publicAccessToken}`;
    navigator.clipboard?.writeText(href);
  }

  return (
    <Box>
      <AppBar position="sticky"><Toolbar><Typography variant="h6" sx={{ flex: 1 }}>Závodníci</Typography><Button color="inherit" href="/admin">Admin</Button><Button color="inherit" href="/admin/checkpoints">Checkpointy</Button></Toolbar></AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Typography variant="h4" fontWeight={900} sx={{ flex: 1 }}>Správa závodníků</Typography>
            <TextField label="Hledat" value={query} onChange={(event) => setQuery(event.target.value)} sx={{ minWidth: 260 }} />
            <FormControl sx={{ minWidth: 280 }}><InputLabel>Závod</InputLabel><Select label="Závod" value={raceId} onChange={(event) => setRaceId(event.target.value)}>{races.map((race) => <MenuItem key={race.id} value={race.id}>{race.name} ({race.year})</MenuItem>)}</Select></FormControl>
          </Stack>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Číslo</TableCell><TableCell>Jméno</TableCell><TableCell>Kontakt</TableCell><TableCell>Platba / stav</TableCell><TableCell>Psi</TableCell><TableCell>Trasa</TableCell><TableCell>Race stav</TableCell><TableCell align="right">Akce</TableCell></TableRow></TableHead>
              <TableBody>{filtered.map((racer) => <TableRow key={racer.id} hover>
                <TableCell><Chip label={racer.startNumber || "—"} /></TableCell>
                <TableCell><Typography fontWeight={800}>{racerName(racer)}</Typography><Typography variant="caption" color="text.secondary">/r/{racer.publicAccessToken}</Typography></TableCell>
                <TableCell><Typography variant="body2">{racer.email || "—"}</Typography><Typography variant="body2">{racer.phone || "—"}</Typography></TableCell>
                <TableCell><Typography variant="body2">{racer.paymentStatus || "—"}</Typography><Typography variant="body2" color="text.secondary">{racer.registrationStatus || "—"}</Typography></TableCell>
                <TableCell><Typography variant="body2">{[racer.dog1Name, racer.dog2Name, racer.dog3Name].filter(Boolean).join(", ") || "—"}</Typography></TableCell>
                <TableCell>{racer.routeName || "—"}</TableCell>
                <TableCell><Chip size="small" label={racer.state?.status || "NOT_STARTED"} /><Typography variant="caption" display="block">Km: {racer.state?.lastCheckpointKm ?? 0}</Typography></TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => copyRacerLink(racer)}><ContentCopyIcon /></IconButton>
                  <IconButton onClick={() => openTimeline(racer)}><HistoryIcon /></IconButton>
                  <IconButton onClick={() => setEditRacer({ ...racer })}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteRacer(racer)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>

      <Dialog open={!!editRacer} onClose={() => setEditRacer(null)} maxWidth="md" fullWidth>
        <DialogTitle>Upravit závodníka</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
          {editRacer && editableFields.map((field) => <TextField key={String(field.key)} label={field.label} value={(editRacer[field.key] as string | null | undefined) || ""} onChange={(event) => setEditRacer((prev) => prev ? { ...prev, [field.key]: event.target.value } : prev)} />)}
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setEditRacer(null)}>Zrušit</Button><Button variant="contained" onClick={saveRacer} disabled={saving}>Uložit</Button></DialogActions>
      </Dialog>

      <Dialog open={!!deleteRacer} onClose={() => setDeleteRacer(null)}><DialogTitle>Smazat závodníka?</DialogTitle><DialogContent>Opravdu smazat závodníka {deleteRacer ? racerName(deleteRacer) : ""}?</DialogContent><DialogActions><Button onClick={() => setDeleteRacer(null)}>Zrušit</Button><Button color="error" variant="contained" onClick={removeRacer}>Smazat</Button></DialogActions></Dialog>

      <Drawer anchor="right" open={!!timelineRacer} onClose={() => setTimelineRacer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 520 } } }}>
        <Box sx={{ p: 3 }}><Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>Historie průchodů</Typography>
          {timelineRacer && <Card><CardContent><Typography fontWeight={800}>{racerName(timelineRacer)}</Typography><Typography color="text.secondary">#{timelineRacer.startNumber || "—"}</Typography></CardContent></Card>}
          {timeline.length === 0 && <Alert severity="info">Zatím bez událostí.</Alert>}
          {timeline.map((item) => <Card key={item.id}><CardContent><Stack spacing={0.5}><Typography fontWeight={800}>{item.type}</Typography><Typography>{item.checkpoint || "bez checkpointu"}{item.checkpointKm !== null ? ` · ${item.checkpointKm} km` : ""}</Typography><Typography color="text.secondary">{formatDate(item.createdAt)}</Typography></Stack></CardContent></Card>)}
          <Divider /><Button onClick={() => setTimelineRacer(null)}>Zavřít</Button>
        </Stack></Box>
      </Drawer>
    </Box>
  );
}
