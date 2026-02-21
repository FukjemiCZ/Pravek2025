"use client";

import { Box, Typography } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import CampingIcon from "@mui/icons-material/Hotel";

interface Checkpoint {
    id: string;
    name: string;
    km: number;
}

interface Bivak {
    id: string;
    km: number;
    note?: string;
}

interface FoodStop {
    id: string;
    km: number;
    name: string;
    village: string;
}

interface Props {
    checkpoints: Checkpoint[];
    bivaks: Bivak[];
    foodStops: FoodStop[];
}

export default function TimelineSection({ checkpoints, bivaks, foodStops }: Props) {
    const maxKm =
        Math.max(
            ...checkpoints.map((c) => c.km),
            ...(bivaks.length ? bivaks.map((b) => b.km) : [0]),
            ...(foodStops.length ? foodStops.map((f) => f.km) : [0])
        ) + 5;

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Trasa závodu – timeline
            </Typography>

            <Box
                sx={{
                    position: "relative",
                    height: 100,
                    borderBottom: "2px solid #ccc",
                }}
            >
                {/* BODY */}
                {checkpoints.map((c) => (
                    <Box
                        key={c.id}
                        sx={{
                            position: "absolute",
                            left: `${(c.km / maxKm) * 100}%`,
                            transform: "translateX(-50%)",
                            textAlign: "center",
                        }}
                    >
                        <RoomIcon color="primary" />
                        <Typography variant="caption">{c.name}</Typography>
                        <Typography variant="caption">{c.km} km</Typography>
                    </Box>
                ))}

                {foodStops.map((f) => (
                    <Box
                        key={f.id}
                        sx={{
                            position: "absolute",
                            left: `${(f.km / maxKm) * 100}%`,
                            transform: "translateX(-50%)",
                            textAlign: "center",
                        }}
                    >
                        <LocalBarIcon sx={{ color: "orange" }} />
                        <Typography variant="caption">{f.name}</Typography>
                        <Typography variant="caption">{f.km} km</Typography>
                    </Box>
                ))}

                {bivaks.map((b) => (
                    <Box
                        key={b.id}
                        sx={{
                            position: "absolute",
                            left: `${(b.km / maxKm) * 100}%`,
                            transform: "translateX(-50%)",
                            textAlign: "center",
                        }}
                    >
                        <CampingIcon sx={{ color: "green" }} />
                        <Typography variant="caption">Bivak</Typography>
                        <Typography variant="caption">{b.km} km</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
