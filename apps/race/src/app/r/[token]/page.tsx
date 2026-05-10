"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
export default function RacerMobilePage(){
  const {token}=useParams<{token:string}>(); const [data,setData]=useState<any>(null); const [msg,setMsg]=useState("");
  async function load(){setData(await (await fetch(`/api/racer/me?token=${token}`)).json())}
  async function event(type:string, checkpointId?:string){await fetch("/api/racer/event",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token,type,checkpointId})}); setMsg("Uloženo."); await load();}
  useEffect(()=>{load()},[token]);
  if(!data)return null;
  if(data.error)return <Container sx={{py:3}}><Alert severity="error">{data.error}</Alert></Container>
  return <Box sx={{minHeight:"100vh",bgcolor:"background.default",py:3}}><Container maxWidth="sm"><Stack spacing={2}><Card><CardContent><Typography variant="h4" fontWeight={900}>{data.race.name}</Typography><Typography>{data.racer.firstName} {data.racer.lastName}</Typography><Typography>Stav: {data.racer.state?.status||"NOT_STARTED"}</Typography></CardContent></Card>{msg&&<Alert severity="success">{msg}</Alert>}<Button size="large" variant="contained" onClick={()=>event("RACER_STARTED")}>Jsem na trase</Button>{data.checkpoints.filter((c:any)=>c.distanceKm>0).map((cp:any)=><Button key={cp.id} size="large" variant="outlined" onClick={()=>event("CHECKPOINT_REACHED",cp.id)}>{cp.name} · {cp.distanceKm} km</Button>)}<Button color="success" size="large" variant="contained" onClick={()=>event("RACER_FINISHED")}>Jsem v cíli</Button><Button color="warning" size="large" variant="outlined" onClick={()=>event("RACER_DNF")}>Končím / DNF</Button></Stack></Container></Box>
}
