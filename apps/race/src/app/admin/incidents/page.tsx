"use client";
import { useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AdminShell } from "@/components/AdminShell";
export default function IncidentsPage(){
  const [raceId,setRaceId]=useState(""); const [racers,setRacers]=useState<any[]>([]); const [incidents,setIncidents]=useState<any[]>([]); const [form,setForm]=useState<any>({type:"OTHER",severity:"MEDIUM",title:"",description:""});
  async function load(){const races=(await (await fetch("/api/admin/races")).json()).races||[]; const rid=raceId||races[0]?.id||""; setRaceId(rid); if(rid){setRacers((await (await fetch(`/api/admin/racers?raceId=${rid}`)).json()).racers||[]); setIncidents((await (await fetch(`/api/admin/incidents?raceId=${rid}`)).json()).incidents||[]);}}
  useEffect(()=>{load()},[]);
  async function create(){await fetch("/api/admin/incidents",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...form,raceId,racerId:form.racerId||null})}); setForm({type:"OTHER",severity:"MEDIUM",title:"",description:""}); await load();}
  async function resolve(i:any){await fetch(`/api/admin/incidents/${i.id}`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({status:"RESOLVED"})}); await load();}
  return <AdminShell title="Incidenty">
    <Card><CardContent><Stack spacing={2}><Typography variant="h6">Nový incident</Typography><TextField select label="Závodník" value={form.racerId||""} onChange={e=>setForm({...form,racerId:e.target.value})}><MenuItem value="">Bez závodníka</MenuItem>{racers.map(r=><MenuItem key={r.id} value={r.id}>{r.startNumber} {r.firstName} {r.lastName}</MenuItem>)}</TextField><TextField select label="Typ" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{["INJURY","LOST","DOG_ISSUE","TRANSPORT_NEEDED","TIMEOUT","MANUAL_NOTE","OTHER"].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField><TextField select label="Závažnost" value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}>{["LOW","MEDIUM","HIGH","CRITICAL"].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField><TextField label="Název" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><TextField multiline minRows={3} label="Popis" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><Button variant="contained" onClick={create} disabled={!form.title}>Vytvořit incident</Button></Stack></CardContent></Card>
    {incidents.length===0&&<Alert severity="success">Žádné incidenty.</Alert>}
    {incidents.map(i=><Card key={i.id}><CardContent><Stack spacing={1}><Typography fontWeight={900}>{i.title}</Typography><Typography>{i.type} · {i.severity} · {i.status}</Typography><Typography>{i.racer?`${i.racer.firstName} ${i.racer.lastName}`:"bez závodníka"}</Typography><Typography color="text.secondary">{i.description}</Typography>{i.status!=="RESOLVED"&&<Button onClick={()=>resolve(i)}>Označit jako vyřešený</Button>}</Stack></CardContent></Card>)}
  </AdminShell>;
}
