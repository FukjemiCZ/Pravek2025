"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Container, Divider, Stack, TextField, Typography } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

type Checkpoint = { id: string; name: string; order: number; distanceKm: number };
type RacerData = { racer: { firstName: string; lastName: string; startNumber?: string; state?: { status: string; lastCheckpointKm?: number; photoCount?: number } }; race: { name: string; year: number }; checkpoints: Checkpoint[] };

export default function RacerPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState("");
  const [data, setData] = useState<RacerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { params.then((p) => setToken(p.token)); }, [params]);
  useEffect(() => { if (token) load(); }, [token]);

  async function load() {
    const res = await fetch(`/api/racer/me?token=${token}`);
    if (!res.ok) { setError("Nepodařilo se načíst závodníka."); return; }
    setData(await res.json());
  }

  async function sendEvent(type: string, checkpointId?: string) {
    setError(null);
    const res = await fetch("/api/racer/event", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, type, checkpointId }) });
    if (!res.ok) { setError("Akci se nepodařilo uložit."); return; }
    await load();
  }

  async function upload(file: File, checkpointId?: string) {
    setUploading(true);
    const form = new FormData();
    form.set("token", token);
    form.set("file", file);
    if (checkpointId) form.set("checkpointId", checkpointId);
    if (caption) form.set("caption", caption);
    const res = await fetch("/api/racer/photos", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) { setError("Fotku se nepodařilo nahrát."); return; }
    setCaption("");
    await load();
  }

  if (!data) return <Container maxWidth="sm" sx={{ py: 4 }}><Typography>Načítám…</Typography></Container>;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Stack spacing={2}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="overline">{data.race.name}</Typography>
              <Typography variant="h4" fontWeight={900}>{data.racer.firstName} {data.racer.lastName}</Typography>
              <Stack direction="row" spacing={1}><Chip label={`Číslo ${data.racer.startNumber || "—"}`} /><Chip color="primary" label={data.racer.state?.status || "NOT_STARTED"} /></Stack>
              <Typography>Poslední známý km: <b>{data.racer.state?.lastCheckpointKm ?? 0}</b></Typography>
              <Typography>Počet nahraných fotek: <b>{data.racer.state?.photoCount ?? 0}</b></Typography>
            </Stack>
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        <Button size="large" variant="contained" onClick={() => sendEvent("RACER_STARTED")}>Jsem na trase</Button>
        <Button size="large" variant="contained" color="success" onClick={() => sendEvent("RACER_FINISHED")}>Jsem v cíli</Button>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Fotka kdykoli z trasy</Typography>
              <TextField label="Popisek fotky" value={caption} onChange={(e) => setCaption(e.target.value)} />
              <Button component="label" startIcon={<CameraAltIcon />} variant="outlined" disabled={uploading}>Nahrát fotku<input hidden type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></Button>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="h6" fontWeight={900}>Checkpointy</Typography>
        {data.checkpoints.filter((cp) => cp.order > 0).map((cp) => (
          <Card key={cp.id} sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography fontWeight={900}>{cp.name}</Typography>
                <Typography color="text.secondary">{cp.distanceKm} km od startu</Typography>
                <Button variant="contained" onClick={() => sendEvent("CHECKPOINT_REACHED", cp.id)}>Potvrdit průchod</Button>
                <Button component="label" variant="outlined" startIcon={<CameraAltIcon />} disabled={uploading}>Přidat fotku k checkpointu<input hidden type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], cp.id)} /></Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
        <Divider />
        <Button color="error" variant="outlined" onClick={() => sendEvent("RACER_DNF")}>Ukončuji závod / DNF</Button>
      </Stack>
    </Container>
  );
}
