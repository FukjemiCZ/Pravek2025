"use client";
import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
export default function LivePage(){
  const [data,setData]=useState<any>({racers:[]});
  async function load(){setData(await (await fetch("/api/live",{cache:"no-store"})).json())}
  useEffect(()=>{load(); const i=setInterval(load,10000); return()=>clearInterval(i)},[]);
  return <Box sx={{minHeight:"100vh",bgcolor:"background.default",py:3}}><Container maxWidth="xl"><Stack spacing={3}><Typography variant="h3" fontWeight={900}>Live board</Typography><Typography variant="h6">{data.race?.name}</Typography><Grid container spacing={2}>{(data.racers||[]).map((r:any)=><Grid item xs={12} md={4} key={r.id}><Card><CardContent><Stack spacing={1}><Chip label={r.startNumber||"bez čísla"} sx={{alignSelf:"flex-start"}}/><Typography variant="h5" fontWeight={900}>{r.firstName} {r.lastName}</Typography><Typography>{r.routeName||""}</Typography><Typography>Stav: <b>{r.state?.status||"NOT_STARTED"}</b></Typography><Typography>Km: {r.state?.lastCheckpointKm??0}</Typography></Stack></CardContent></Card></Grid>)}</Grid></Stack></Container></Box>
}
