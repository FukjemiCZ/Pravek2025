"use client";
import { useEffect, useState } from "react";
import { Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AdminShell } from "@/components/AdminShell";
export default function ExportsPage(){
  const [races,setRaces]=useState<any[]>([]); const [raceId,setRaceId]=useState("");
  useEffect(()=>{fetch("/api/admin/races").then(r=>r.json()).then(j=>{setRaces(j.races||[]); setRaceId(j.races?.[0]?.id||"")})},[]);
  return <AdminShell title="Export výsledků"><Card><CardContent><Stack spacing={2}><Typography variant="h6">Export výsledků a mezičasů</Typography><TextField select label="Závod" value={raceId} onChange={e=>setRaceId(e.target.value)}>{races.map(r=><MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}</TextField><Button variant="contained" href={`/api/admin/exports?raceId=${raceId}&format=csv`}>Stáhnout CSV</Button><Button variant="outlined" href={`/api/admin/exports?raceId=${raceId}&format=json`}>Stáhnout JSON</Button></Stack></CardContent></Card></AdminShell>
}
