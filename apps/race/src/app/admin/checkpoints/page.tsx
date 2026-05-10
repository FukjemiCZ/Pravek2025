"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, AppBar, Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

type Race = { id: string; name: string; year: number };
type Checkpoint = { id: string; raceId: string; name: string; order: number; distanceKm: number };

type CheckpointForm = { id?: string; name: string; order: number; distanceKm: number };

const emptyForm: CheckpointForm = { name: "", order: 1, distanceKm: 0 };

export default function CheckpointsPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [raceId, setRaceId] = useState("");
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [form, setForm] = useState<CheckpointForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Checkpoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeRace = useMemo(() => races.find((race) => race.id === raceId), [races, raceId]);

  async function ensureLoggedIn() {
    const me = await fetch("/api/admin/me");
    if (me.status === 401) window.location.href = "/login";
  }

  async function loadRaces() {
    const response = await fetch("/api/admin/races");
    const json = await response.json();
    const loadedRaces = json.races || [];
    setRaces(loadedRaces);
    setRaceId((current) => current || loadedRaces[0]?.id || "");
  }

  async function loadCheckpoints(selectedRaceId = raceId) {
    if (!selectedRaceId) return;
    const response = await fetch(`/api/admin/checkpoints?raceId=${selectedRaceId}`);
    const json = await response.json();
    setCheckpoints(json.checkpoints || []);
  }

  useEffect(() => {
    ensureLoggedIn().then(loadRaces).catch(() => setError("Nepodařilo se načíst závody."));
  }, []);

  useEffect(() => {
    if (raceId) loadCheckpoints(raceId).catch(() => setError("Nepodařilo se načíst checkpointy."));
  }, [raceId]);

  async function saveCheckpoint() {
    if (!raceId) return;
    setSaving(true);
    setError(null);
    const payload = { raceId, name: form.name, order: Number(form.order), distanceKm: Number(form.distanceKm) };
    const url = form.id ? `/api/admin/checkpoints/${form.id}` : "/api/admin/checkpoints";
    const method = form.id ? "PUT" : "POST";
    const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form.id ? { name: payload.name, order: payload.order, distanceKm: payload.distanceKm } : payload) });
    setSaving(false);
    if (!response.ok) {
      setError("Uložení checkpointu selhalo.");
      return;
    }
    setForm(emptyForm);
    await loadCheckpoints();
  }

  async function deleteCheckpoint() {
    if (!deleteTarget) return;
    const response = await fetch(`/api/admin/checkpoints/${deleteTarget.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Smazání checkpointu selhalo. Možná má navázané průchody.");
      return;
    }
    setDeleteTarget(null);
    await loadCheckpoints();
  }

  async function moveCheckpoint(checkpoint: Checkpoint, direction: -1 | 1) {
    const sorted = [...checkpoints].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((item) => item.id === checkpoint.id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return;
    const swapped = [...sorted];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const items = swapped.map((item, orderIndex) => ({ id: item.id, order: orderIndex + 1 }));
    const response = await fetch("/api/admin/checkpoints/reorder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raceId, items }) });
    if (!response.ok) {
      setError("Změna pořadí selhala.");
      return;
    }
    await loadCheckpoints();
  }

  return (
    <Box>
      <AppBar position="sticky"><Toolbar><Typography variant="h6" sx={{ flex: 1 }}>Checkpointy</Typography><Button color="inherit" href="/admin">Admin</Button><Button color="inherit" href="/admin/racers">Závodníci</Button></Toolbar></AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Typography variant="h4" fontWeight={900} sx={{ flex: 1 }}>Správa checkpointů</Typography>
            <FormControl sx={{ minWidth: 280 }}><InputLabel>Závod</InputLabel><Select label="Závod" value={raceId} onChange={(event) => setRaceId(event.target.value)}>{races.map((race) => <MenuItem key={race.id} value={race.id}>{race.name} ({race.year})</MenuItem>)}</Select></FormControl>
          </Stack>

          <Card><CardContent><Stack spacing={2}>
            <Typography variant="h6">{form.id ? "Upravit checkpoint" : "Přidat checkpoint"}</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField fullWidth label="Název" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              <TextField label="Pořadí" type="number" value={form.order} onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))} />
              <TextField label="Km od startu" type="number" value={form.distanceKm} onChange={(event) => setForm((prev) => ({ ...prev, distanceKm: Number(event.target.value) }))} />
              <Button variant="contained" onClick={saveCheckpoint} disabled={!form.name || saving || !raceId}>{form.id ? "Uložit" : "Přidat"}</Button>
              {form.id && <Button variant="outlined" onClick={() => setForm(emptyForm)}>Zrušit</Button>}
            </Stack>
          </Stack></CardContent></Card>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Pořadí</TableCell><TableCell>Název</TableCell><TableCell>Km</TableCell><TableCell align="right">Akce</TableCell></TableRow></TableHead>
              <TableBody>{checkpoints.map((checkpoint) => <TableRow key={checkpoint.id} hover>
                <TableCell>{checkpoint.order}</TableCell>
                <TableCell><Typography fontWeight={800}>{checkpoint.name}</Typography></TableCell>
                <TableCell>{checkpoint.distanceKm} km</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => moveCheckpoint(checkpoint, -1)}><ArrowUpwardIcon /></IconButton>
                  <IconButton onClick={() => moveCheckpoint(checkpoint, 1)}><ArrowDownwardIcon /></IconButton>
                  <IconButton href={`/admin/checkpoint/${checkpoint.id}/view`}><VisibilityIcon /></IconButton>
                  <IconButton href={`/admin/checkpoint/${checkpoint.id}/checkin`}><QrCodeScannerIcon /></IconButton>
                  <IconButton onClick={() => setForm({ id: checkpoint.id, name: checkpoint.name, order: checkpoint.order, distanceKm: checkpoint.distanceKm })}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteTarget(checkpoint)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </TableContainer>

          {activeRace && <Alert severity="info">Aktivní závod: {activeRace.name}. Board a check-in otevřeš ikonami v tabulce.</Alert>}
        </Stack>
      </Container>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}><DialogTitle>Smazat checkpoint?</DialogTitle><DialogContent>Opravdu smazat checkpoint {deleteTarget?.name}?</DialogContent><DialogActions><Button onClick={() => setDeleteTarget(null)}>Zrušit</Button><Button color="error" variant="contained" onClick={deleteCheckpoint}>Smazat</Button></DialogActions></Dialog>
    </Box>
  );
}
