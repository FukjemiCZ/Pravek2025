"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import { useParams } from "next/navigation";
function key(id:string){return `offline-checkins-${id}`;}
export default function CheckinPage(){
  const {id}=useParams<{id:string}>(); const input=useRef<HTMLInputElement|null>(null);
  const [token,setToken]=useState(""); const [board,setBoard]=useState<any>(null); const [msg,setMsg]=useState(""); const [err,setErr]=useState(""); const [pending,setPending]=useState<any[]>([]); const [recent,setRecent]=useState<any[]>([]);
  async function load(){const r=await fetch(`/api/admin/checkpoint/${id}/board`); if(r.ok)setBoard(await r.json());}
  function readQueue(){const q=JSON.parse(localStorage.getItem(key(id))||"[]"); setPending(q); return q;}
  function writeQueue(q:any[]){localStorage.setItem(key(id),JSON.stringify(q)); setPending(q);}
  async function post(item:any){const r=await fetch("/api/admin/checkpoint-checkin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(item)}); if(!r.ok)throw new Error((await r.json()).error||"Check-in selhal."); return r.json();}
  async function sync(){const q=readQueue(); const left=[]; for(const item of q){try{const res=await post(item); setRecent(x=>[res,...x].slice(0,10));}catch{left.push(item)}} writeQueue(left);}
  async function submit(e:FormEvent){e.preventDefault(); setErr(""); setMsg(""); if(!token.trim())return; const item={checkpointId:id,token:token.trim(),offlineCreatedAt:new Date().toISOString()}; try{const res=await post(item); setMsg(`OK: ${res.racer.firstName} ${res.racer.lastName}`); setRecent(x=>[res,...x].slice(0,10));}catch(ex:any){ if(!navigator.onLine){const q=readQueue(); q.push(item); writeQueue(q); setMsg("Uloženo offline, odešle se po připojení.");} else setErr(ex.message);} setToken(""); input.current?.focus();}
  useEffect(()=>{load(); readQueue(); sync(); window.addEventListener("online",sync); input.current?.focus(); return()=>window.removeEventListener("online",sync);},[id]);
  return <Box sx={{minHeight:"100vh",bgcolor:"background.default",py:3}}><Container maxWidth="sm"><Stack spacing={2}>
    <Card><CardContent><Typography variant="overline">Checkpoint check-in</Typography><Typography variant="h3" fontWeight={900}>{board?.checkpoint?.name||"Checkpoint"}</Typography><Typography color="text.secondary">{board?.race?.name} · {board?.checkpoint?.distanceKm??0} km</Typography></CardContent></Card>
    <Card><CardContent><form onSubmit={submit}><Stack spacing={2}><TextField inputRef={input} label="QR token nebo URL" value={token} onChange={e=>setToken(e.target.value)} autoFocus/><Button type="submit" variant="contained" size="large">Potvrdit průchod</Button><Button href={`/admin/checkpoint/${id}/view`}>Board</Button></Stack></form></CardContent></Card>
    {pending.length>0&&<Alert severity="warning">Offline fronta: {pending.length} záznamů <Button onClick={sync}>Synchronizovat</Button></Alert>}
    {msg&&<Alert severity="success">{msg}</Alert>}{err&&<Alert severity="error">{err}</Alert>}
    <Card><CardContent><Typography fontWeight={900}>Poslední check-iny</Typography>{recent.map((r,i)=><Typography key={i}>{r.racer?.startNumber} {r.racer?.firstName} {r.racer?.lastName}</Typography>)}</CardContent></Card>
  </Stack></Container></Box>
}
