"use client";
import { useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { AdminShell } from "@/components/AdminShell";

type Race = { id: string; name: string; year: number };
type Checkpoint = { id: string; raceId: string; name: string; order: number; distanceKm: number };
const empty = { name: "", order: 1, distanceKm: 0, id: "" };

export default function CheckpointsPage() {
  const [race, setRace] = useState<Race | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState<Checkpoint | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const races = (await (await fetch("/api/admin/races")).json()).races || [];
    const active = races[0];
    setRace(active);
    if (active) setCheckpoints((await (await fetch(`/api/admin/checkpoints?raceId=${active.id}`)).json()).checkpoints || []);
  }
  useEffect(() => { load().catch(() => setError("Nelze načíst checkpointy.")); }, []);

  async function save() {
    if (!race) return;
    const isEdit = !!form.id;
    const res = await fetch(isEdit ? `/api/admin/checkpoints/${form.id}` : "/api/admin/checkpoints", {
      method: isEdit ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(isEdit ? { name: form.name, order: Number(form.order), distanceKm: Number(form.distanceKm) } : { raceId: race.id, name: form.name, order: Number(form.order), distanceKm: Number(form.distanceKm) })
    });
    if (!res.ok) { setError("Uložení selhalo."); return; }
    setForm(empty); await load();
  }

  async function remove() {
    if (!del) return;
    await fetch(`/api/admin/checkpoints/${del.id}`, { method: "DELETE" });
    setDel(null); await load();
  }

  async function move(cp: Checkpoint, dir: -1 | 1) {
    if (!race) return;
    const list = [...checkpoints].sort((a,b) => a.order-b.order);
    const idx = list.findIndex(x => x.id === cp.id), next = idx + dir;
    if (next < 0 || next >= list.length) return;
    [list[idx], list[next]] = [list[next], list[idx]];
    await fetch("/api/admin/checkpoints/reorder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ raceId: race.id, items: list.map((x,i) => ({ id: x.id, order: i+1 })) }) });
    await load();
  }

  return <AdminShell title="Checkpointy">
    {error && <Alert severity="error">{error}</Alert>}
    <Card><CardContent><Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField label="Název" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <TextField label="Pořadí" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
      <TextField label="Km" type="number" value={form.distanceKm} onChange={e => setForm({ ...form, distanceKm: Number(e.target.value) })} />
      <Button variant="contained" onClick={save}>{form.id ? "Uložit" : "Přidat"}</Button>
      {form.id && <Button onClick={() => setForm(empty)}>Zrušit</Button>}
    </Stack></CardContent></Card>
    <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Pořadí</TableCell><TableCell>Název</TableCell><TableCell>Km</TableCell><TableCell align="right">Akce</TableCell></TableRow></TableHead><TableBody>
      {checkpoints.map(cp => <TableRow key={cp.id}><TableCell>{cp.order}</TableCell><TableCell><Typography fontWeight={800}>{cp.name}</Typography></TableCell><TableCell>{cp.distanceKm}</TableCell><TableCell align="right">
        <IconButton onClick={() => move(cp, -1)}><ArrowUpwardIcon /></IconButton>
        <IconButton onClick={() => move(cp, 1)}><ArrowDownwardIcon /></IconButton>
        <IconButton href={`/admin/checkpoint/${cp.id}/view`}><VisibilityIcon /></IconButton>
        <IconButton href={`/admin/checkpoint/${cp.id}/checkin`}><QrCodeScannerIcon /></IconButton>
        <IconButton onClick={() => setForm({ id: cp.id, name: cp.name, order: cp.order, distanceKm: cp.distanceKm })}><EditIcon /></IconButton>
        <IconButton color="error" onClick={() => setDel(cp)}><DeleteIcon /></IconButton>
      </TableCell></TableRow>)}
    </TableBody></Table></TableContainer>
    <Dialog open={!!del} onClose={() => setDel(null)}><DialogTitle>Smazat checkpoint?</DialogTitle><DialogContent>{del?.name}</DialogContent><DialogActions><Button onClick={() => setDel(null)}>Zrušit</Button><Button color="error" onClick={remove}>Smazat</Button></DialogActions></Dialog>
  </AdminShell>;
}
