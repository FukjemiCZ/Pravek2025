"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useParams } from "next/navigation";
function ft(v:string){return new Intl.DateTimeFormat("cs-CZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(v));}
export default function CheckpointBoardPage(){
  const {id}=useParams<{id:string}>();
  const [data,setData]=useState<any>(null); const [error,setError]=useState("");
  async function load(){const r=await fetch(`/api/admin/checkpoint/${id}/board`,{cache:"no-store"}); if(r.status===401){location.href="/login";return;} if(!r.ok){setError("Nelze načíst board.");return;} setData(await r.json());}
  useEffect(()=>{load(); const i=setInterval(load,10000); return()=>clearInterval(i);},[id]);
  return <Box sx={{minHeight:"100vh",bgcolor:"background.default",py:3}}><Container maxWidth="xl"><Stack spacing={3}>
    {error&&<Alert severity="error">{error}</Alert>}
    <Card><CardContent><Stack direction={{xs:"column",md:"row"}} alignItems={{md:"center"}}><Box sx={{flex:1}}><Typography variant="h3" fontWeight={900}>{data?.checkpoint?.name||"Checkpoint"}</Typography><Typography variant="h6" color="text.secondary">{data?.race?.name} · {data?.checkpoint?.distanceKm??0} km</Typography></Box><Button href="/admin/checkpoints">Checkpointy</Button><Button variant="contained" href={`/admin/checkpoint/${id}/checkin`}>Check-in</Button></Stack></CardContent></Card>
    <Card><CardContent><Typography variant="overline">Počet průchodů</Typography><Typography variant="h2">{data?.passages?.length??0}</Typography></CardContent></Card>
    <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Čas</TableCell><TableCell>Číslo</TableCell><TableCell>Závodník</TableCell><TableCell>Kontakt</TableCell><TableCell>Stav</TableCell></TableRow></TableHead><TableBody>{(data?.passages||[]).map((p:any)=><TableRow key={p.id}><TableCell><Typography fontWeight={900}>{ft(p.createdAt)}</Typography></TableCell><TableCell><Chip label={p.racer?.startNumber||"—"}/></TableCell><TableCell>{p.racer?`${p.racer.firstName} ${p.racer.lastName}`:"—"}</TableCell><TableCell>{p.racer?.phone||"—"}<br/>{p.racer?.email||"—"}</TableCell><TableCell><Chip size="small" label={p.racer?.state?.status||"—"}/></TableCell></TableRow>)}</TableBody></Table></TableContainer>
  </Stack></Container></Box>
}
