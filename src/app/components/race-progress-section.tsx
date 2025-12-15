"use client";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Avatar,
    Grid,
    Button,
    TextField,
    Link as MuiLink,
} from "@mui/material";

import RoomIcon from "@mui/icons-material/Room"; // ikona mapy

import { useState } from "react";
import PhotoUpload from "./photo-upload";
import TimelineSection from "./timeline-section";

interface Checkpoint {
    id: string;
    name: string;
    km: number;
    time?: string | null;
    photoUrl?: string | null;
}

interface Bivak {
    id: string;
    km: number;
    note?: string;
    mapUrl?: string;
    arrive?: string | null;
    leave?: string | null;
    arrivePhoto?: string | null;
    leavePhoto?: string | null;
}

interface FoodStop {
    id: string;
    village: string;
    name: string;
    km: number;
    mapUrl?: string;
    arrive?: string | null;
    leave?: string | null;
    arrivePhoto?: string | null;
    leavePhoto?: string | null;
}

interface Props {
    startTime?: string | null;
    startPhoto?: string | null;
    finishTime?: string | null;
    finishPhoto?: string | null;
    checkpoints: Checkpoint[];
}

export default function RaceProgressSection({
    startTime,
    startPhoto,
    finishTime,
    finishPhoto,
    checkpoints,
}: Props) {
    const [data, setData] = useState({
        startTime,
        startPhoto,
        finishTime,
        finishPhoto,
        checkpoints,
        bivaks: [] as Bivak[],
        foodStops: [] as FoodStop[],
    });

    // Lokální stavy pro přidání bivaku
    const [bkm, setBkm] = useState("");
    const [bnote, setBnote] = useState("");
    const [bmap, setBmap] = useState("");

    // Lokální stavy pro přidání hospody
    const [fname, setFname] = useState("");
    const [fvillage, setFvillage] = useState("");
    const [fkm, setFkm] = useState("");
    const [fmap, setFmap] = useState("");

    /** START — pouze fotka */
    const handleStartPhoto = (file: File) => {
        setData({
            ...data,
            startPhoto: URL.createObjectURL(file),
            startTime: new Date().toISOString(),
        });
    };

    /** FINISH */
    const handleFinishPhoto = (file: File) => {
        setData({
            ...data,
            finishPhoto: URL.createObjectURL(file),
            finishTime: new Date().toISOString(),
        });
    };

    /** CHECKPOINT */
    const handleCheckpointPhoto = (id: string, file: File) => {
        const url = URL.createObjectURL(file);
        setData({
            ...data,
            checkpoints: data.checkpoints.map((cp) =>
                cp.id === id
                    ? {
                        ...cp,
                        time: new Date().toISOString(),
                        photoUrl: url,
                    }
                    : cp
            ),
        });
    };

    /** BIVAK — přidání */
    const addBivak = () => {
        if (!bkm) return;

        setData({
            ...data,
            bivaks: [
                ...data.bivaks,
                {
                    id: crypto.randomUUID(),
                    km: Number(bkm),
                    note: bnote,
                    mapUrl: bmap || undefined,
                },
            ],
        });

        setBkm("");
        setBnote("");
        setBmap("");
    };

    /** BIVAK — příchod nebo odchod */
    const updateBivakPhoto = (
        id: string,
        type: "arrive" | "leave",
        file: File
    ) => {
        const url = URL.createObjectURL(file);
        setData({
            ...data,
            bivaks: data.bivaks.map((b) =>
                b.id === id
                    ? {
                        ...b,
                        [type]: new Date().toISOString(),
                        [`${type}Photo`]: url,
                    }
                    : b
            ),
        });
    };

    /** HOSPODA — přidání */
    const addFoodStop = () => {
        if (!fname || !fvillage || !fkm) return;

        setData({
            ...data,
            foodStops: [
                ...data.foodStops,
                {
                    id: crypto.randomUUID(),
                    name: fname,
                    village: fvillage,
                    km: Number(fkm),
                    mapUrl: fmap || undefined,
                },
            ],
        });

        setFname("");
        setFvillage("");
        setFkm("");
        setFmap("");
    };

    /** HOSPODA — příchod nebo odchod */
    const updateFoodPhoto = (
        id: string,
        type: "arrive" | "leave",
        file: File
    ) => {
        const url = URL.createObjectURL(file);
        setData({
            ...data,
            foodStops: data.foodStops.map((fs) =>
                fs.id === id
                    ? {
                        ...fs,
                        [type]: new Date().toISOString(),
                        [`${type}Photo`]: url,
                    }
                    : fs
            ),
        });
    };

    return (
        <Card sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Průběh závodu – moje aktivita
                </Typography>

                {/* TIMELINE BLOCK */}
                <TimelineSection
                    checkpoints={data.checkpoints}
                    foodStops={data.foodStops}
                    bivaks={data.bivaks}
                />

                <Grid container spacing={2}>

                    {/* ---------------------- START ---------------------- */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Start</Typography>

                            {!data.startTime ? (
                                <PhotoUpload
                                    label="Potvrdit start fotkou"
                                    onSelect={handleStartPhoto}
                                />
                            ) : (
                                <>
                                    <Chip label="Start potvrzen" color="success" />
                                    <Typography sx={{ mt: 1 }}>
                                        {new Date(data.startTime).toLocaleString()}
                                    </Typography>
                                    {data.startPhoto && (
                                        <Avatar
                                            src={data.startPhoto}
                                            variant="rounded"
                                            sx={{ width: 80, height: 80, mt: 1 }}
                                        />
                                    )}
                                </>
                            )}
                        </Card>
                    </Grid>

                    {/* ---------------------- CHECKPOINTS ---------------------- */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Kontrolní body</Typography>

                            {data.checkpoints.map((cp) => (
                                <Box key={cp.id} sx={{ borderBottom: "1px solid #eee", py: 1 }}>
                                    <Typography>
                                        <strong>{cp.name}</strong> – {cp.km} km
                                    </Typography>

                                    {!cp.time ? (
                                        <PhotoUpload
                                            label="Potvrdit fotkou"
                                            onSelect={(f) => handleCheckpointPhoto(cp.id, f)}
                                        />
                                    ) : (
                                        <>
                                            <Chip label="Splněno" color="success" size="small" />
                                            <Typography sx={{ mt: 1 }}>
                                                {new Date(cp.time).toLocaleString()}
                                            </Typography>

                                            {cp.photoUrl && (
                                                <Avatar
                                                    src={cp.photoUrl}
                                                    variant="rounded"
                                                    sx={{ width: 60, height: 60, mt: 1 }}
                                                />
                                            )}
                                        </>
                                    )}
                                </Box>
                            ))}
                        </Card>
                    </Grid>

                    {/* ---------------------- FINISH ---------------------- */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Cíl</Typography>

                            {!data.finishTime ? (
                                <PhotoUpload
                                    label="Potvrdit cíl fotkou"
                                    onSelect={handleFinishPhoto}
                                />
                            ) : (
                                <>
                                    <Chip label="Dokončeno" color="success" />
                                    <Typography sx={{ mt: 1 }}>
                                        {new Date(data.finishTime).toLocaleString()}
                                    </Typography>
                                    {data.finishPhoto && (
                                        <Avatar
                                            src={data.finishPhoto}
                                            variant="rounded"
                                            sx={{ width: 80, height: 80, mt: 1 }}
                                        />
                                    )}
                                </>
                            )}
                        </Card>
                    </Grid>

                    {/* ---------------------- BIVAKY ---------------------- */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Bivaky (⛺)
                            </Typography>

                            {/* FORM */}
                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                <TextField
                                    label="Kilometr"
                                    value={bkm}
                                    type="number"
                                    onChange={(e) => setBkm(e.target.value)}
                                />
                                <TextField
                                    label="Poznámka"
                                    value={bnote}
                                    onChange={(e) => setBnote(e.target.value)}
                                />
                                <TextField
                                    label="Odkaz na mapy.cz"
                                    value={bmap}
                                    onChange={(e) => setBmap(e.target.value)}
                                />
                                <Button variant="contained" onClick={addBivak}>
                                    Přidat
                                </Button>
                            </Box>

                            {data.bivaks.map((b) => (
                                <Box key={b.id} sx={{ py: 1, borderBottom: "1px solid #eee" }}>
                                    <Typography>
                                        <strong>Bivak:</strong> {b.km} km {b.note ? `– ${b.note}` : ""}
                                    </Typography>

                                    {b.mapUrl && (
                                        <MuiLink
                                            href={b.mapUrl}
                                            target="_blank"
                                            sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                                        >
                                            <RoomIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            Otevřít v Mapy.cz
                                        </MuiLink>
                                    )}

                                    {/* Příchod */}
                                    {!b.arrive ? (
                                        <PhotoUpload
                                            label="Příchod – fotka"
                                            onSelect={(f) =>
                                                updateBivakPhoto(b.id, "arrive", f)
                                            }
                                        />
                                    ) : (
                                        <>
                                            <Typography>Příchod: {new Date(b.arrive).toLocaleString()}</Typography>
                                            {b.arrivePhoto && (
                                                <Avatar
                                                    src={b.arrivePhoto}
                                                    variant="rounded"
                                                    sx={{ width: 60, height: 60, mt: 1 }}
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* Odchod */}
                                    {!b.leave ? (
                                        <PhotoUpload
                                            label="Odchod – fotka"
                                            onSelect={(f) =>
                                                updateBivakPhoto(b.id, "leave", f)
                                            }
                                        />
                                    ) : (
                                        <>
                                            <Typography>Odchod: {new Date(b.leave).toLocaleString()}</Typography>
                                            {b.leavePhoto && (
                                                <Avatar
                                                    src={b.leavePhoto}
                                                    variant="rounded"
                                                    sx={{ width: 60, height: 60, mt: 1 }}
                                                />
                                            )}
                                        </>
                                    )}
                                </Box>
                            ))}
                        </Card>
                    </Grid>

                    {/* ---------------------- FOOD STOPS ---------------------- */}
                    <Grid item xs={12}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Hospody / Food Stops (🍺)
                            </Typography>

                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                <TextField
                                    label="Vesnice"
                                    value={fvillage}
                                    onChange={(e) => setFvillage(e.target.value)}
                                />
                                <TextField
                                    label="Název hospody"
                                    value={fname}
                                    onChange={(e) => setFname(e.target.value)}
                                />
                                <TextField
                                    label="Kilometr"
                                    type="number"
                                    value={fkm}
                                    onChange={(e) => setFkm(e.target.value)}
                                />
                                <TextField
                                    label="Odkaz na mapy.cz"
                                    value={fmap}
                                    onChange={(e) => setFmap(e.target.value)}
                                />
                                <Button variant="contained" onClick={addFoodStop}>
                                    Přidat
                                </Button>
                            </Box>

                            {data.foodStops.map((fs) => (
                                <Box key={fs.id} sx={{ py: 1, borderBottom: "1px solid #eee" }}>
                                    <Typography>
                                        <strong>{fs.village}</strong> – {fs.name} ({fs.km} km)
                                    </Typography>

                                    {fs.mapUrl && (
                                        <MuiLink
                                            href={fs.mapUrl}
                                            target="_blank"
                                            sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                                        >
                                            <RoomIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            Otevřít v Mapy.cz
                                        </MuiLink>
                                    )}

                                    {/* Příchod */}
                                    {!fs.arrive ? (
                                        <PhotoUpload
                                            label="Příchod – fotka"
                                            onSelect={(f) =>
                                                updateFoodPhoto(fs.id, "arrive", f)
                                            }
                                        />
                                    ) : (
                                        <>
                                            <Typography>Příchod: {new Date(fs.arrive).toLocaleString()}</Typography>
                                            {fs.arrivePhoto && (
                                                <Avatar
                                                    src={fs.arrivePhoto}
                                                    variant="rounded"
                                                    sx={{ width: 60, height: 60, mt: 1 }}
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* Odchod */}
                                    {!fs.leave ? (
                                        <PhotoUpload
                                            label="Odchod – fotka"
                                            onSelect={(f) =>
                                                updateFoodPhoto(fs.id, "leave", f)
                                            }
                                        />
                                    ) : (
                                        <>
                                            <Typography>Odchod: {new Date(fs.leave).toLocaleString()}</Typography>
                                            {fs.leavePhoto && (
                                                <Avatar
                                                    src={fs.leavePhoto}
                                                    variant="rounded"
                                                    sx={{ width: 60, height: 60, mt: 1 }}
                                                />
                                            )}
                                        </>
                                    )}
                                </Box>
                            ))}
                        </Card>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
