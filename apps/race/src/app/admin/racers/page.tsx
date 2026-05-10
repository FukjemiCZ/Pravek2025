"use client";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { AdminShell } from "@/components/AdminShell";

type Racer = any;
const fields = ["startNumber","firstName","lastName","email","phone","routeName","paymentStatus","registrationStatus","dog1Name","dog1BirthDate","dog1Breed","dog2Name","dog2BirthDate","dog2Breed","dog3Name","dog3BirthDate","dog3Breed"];
const labels: Record<string,string> = { startNumber:"Startovní číslo", firstName:"Jméno", lastName:"Příjmení", email:"E-mail", phone:"Telefon", routeName:"Trasa", paymentStatus:"Platba", registrationStatus:"Stav registrace", dog1Name:"Jméno 1. psa", dog1BirthDate:"Datum narození 1. psa", dog1Breed:"Plemeno 1. psa", dog2Name:"Jméno 2. psa", dog2BirthDate:"Datum narození 2. psa", dog2Breed:"Plemeno 2. psa", dog3Name:"Jméno 3. psa", dog3BirthDate:"Datum narození 3. psa", dog3Breed:"Plemeno 3. psa" };
function dt(v?: string) { return v ? new Intl.DateTimeFormat("cs-CZ",{dateStyle:"short", timeStyle:"short"}).format(new Date(v)) : "—"; }

export default function RacersPage() {
  const [raceId,setRaceId]=useState("");
  const [racers,setRacers]=useState<Racer[]>([]);
  const [q,setQ]=useState("");
  const [edit,setEdit]=useState<Racer|null>(null);
  const [del,setDel]=useState<Racer|null>(null);
  const [timeline,setTimeline]=useState<any[]|null>(null);
  const [timelineTitle,setTimelineTitle]=useState("");
  const [error,setError]=useState("");

  async function load() {
    const races=(await (await fetch("/api/admin/races")).json()).races||[];
    const rid=raceId||races[0]?.id||"";
    setRaceId(rid);
    if (rid) setRacers((await (await fetch(`/api/admin/racers?raceId=${rid}`)).json()).racers||[]);
  }
  useEffect(()=>{load().catch(()=>setError("Nelze načíst závodníky."));},[]);
  const filtered=useMemo(()=>racers.filter(r=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())),[racers,q]);

  async function save() {
    if (!edit) return;
    const body: any = {};
    fields.forEach(k => body[k] = edit[k] || null);
    const res=await fetch(`/api/admin/racers/${edit.id}`, {method:"PUT", headers:{"content-type":"application/json"}, body:JSON.stringify(body)});
    if(!res.ok){setError("Uložení selhalo."); return;}
    setEdit(null); await load();
  }
  async function remove() { if(!del)return; await fetch(`/api/admin/racers/${del.id}`,{method:"DELETE"}); setDel(null); await load(); }
  async function openTimeline(r:Racer){ setTimelineTitle(`${r.firstName} ${r.lastName}`); setTimeline((await (await fetch(`/api/admin/racers/${r.id}/timeline`)).json()).timeline||[]); }
  function copy(r:Racer){ navigator.clipboard?.writeText(`${window.location.origin}/r/${r.publicAccessToken}`); }

  return <AdminShell title="Závodníci">
    {error&&<Alert severity="error">{error}</Alert>}
    <TextField label="Hledat závodníka" value={q} onChange={e=>setQ(e.target.value)} />
    <TableContainer component={Paper}><Table size="small"><TableHead><TableRow><TableCell>Číslo</TableCell><TableCell>Jméno</TableCell><TableCell>Kontakt</TableCell><TableCell>Platba/Stav</TableCell><TableCell>Psi</TableCell><TableCell>Race stav</TableCell><TableCell align="right">Akce</TableCell></TableRow></TableHead><TableBody>
      {filtered.map(r=><TableRow key={r.id}><TableCell><Chip label={r.startNumber||"—"} /></TableCell><TableCell><Typography fontWeight={800}>{r.firstName} {r.lastName}</Typography><Typography variant="caption">/r/{r.publicAccessToken}</Typography></TableCell><TableCell>{r.email||"—"}<br/>{r.phone||"—"}</TableCell><TableCell>{r.paymentStatus||"—"}<br/>{r.registrationStatus||"—"}</TableCell><TableCell>{[r.dog1Name,r.dog2Name,r.dog3Name].filter(Boolean).join(", ")||"—"}</TableCell><TableCell><Chip size="small" label={r.state?.status||"NOT_STARTED"} /><br/>Km {r.state?.lastCheckpointKm??0}</TableCell><TableCell align="right"><IconButton onClick={()=>copy(r)}><ContentCopyIcon/></IconButton><IconButton onClick={()=>openTimeline(r)}><HistoryIcon/></IconButton><IconButton onClick={()=>setEdit({...r})}><EditIcon/></IconButton><IconButton color="error" onClick={()=>setDel(r)}><DeleteIcon/></IconButton></TableCell></TableRow>)}
    </TableBody></Table></TableContainer>
    <Dialog open={!!edit} onClose={()=>setEdit(null)} maxWidth="md" fullWidth><DialogTitle>Upravit závodníka</DialogTitle><DialogContent><Stack spacing={2} sx={{mt:1}}>{edit&&fields.map(k=><TextField key={k} label={labels[k]||k} value={edit[k]||""} onChange={e=>setEdit({...edit,[k]:e.target.value})}/>)}</Stack></DialogContent><DialogActions><Button onClick={()=>setEdit(null)}>Zrušit</Button><Button variant="contained" onClick={save}>Uložit</Button></DialogActions></Dialog>
    <Dialog open={!!del} onClose={()=>setDel(null)}><DialogTitle>Smazat závodníka?</DialogTitle><DialogContent>{del?.firstName} {del?.lastName}</DialogContent><DialogActions><Button onClick={()=>setDel(null)}>Zrušit</Button><Button color="error" onClick={remove}>Smazat</Button></DialogActions></Dialog>
    <Drawer anchor="right" open={!!timeline} onClose={()=>setTimeline(null)} PaperProps={{sx:{width:{xs:"100%",sm:520}}}}><Stack spacing={2} sx={{p:3}}><Typography variant="h5" fontWeight={900}>Historie: {timelineTitle}</Typography>{timeline?.map(t=><Card key={t.id}><CardContent><Typography fontWeight={800}>{t.type}</Typography><Typography>{t.checkpoint||"bez CP"} {t.checkpointKm!=null?`· ${t.checkpointKm} km`:""}</Typography><Typography color="text.secondary">{dt(t.createdAt)}</Typography></CardContent></Card>)}</Stack></Drawer>
  </AdminShell>;
}
