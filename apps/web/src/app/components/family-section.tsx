"use client";

import {
    Box,
    Card,
    Typography,
    Button,
    Chip,
    Grid,
    Avatar,
} from "@mui/material";
import Link from "next/link";

export type FamilyMember = {
    id: string;
    name: string;
    relation: "self" | "partner" | "child";
    email?: string;
    phone?: string;
    startFee: number;
    paymentStatus: "paid" | "pending";
    registrationStatus: string;
    bibNumber?: number | null;
    pastStarts: number;
    dogs: string[];
    avatarUrl?: string;
};

interface Props {
    members: FamilyMember[];
}

export default function FamilySection({ members }: Props) {
    const relationLabel: Record<FamilyMember["relation"], string> = {
        self: "Já",
        partner: "Partner/ka",
        child: "Dítě",
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Rodinní členové
            </Typography>

            <Grid container spacing={2}>
                {members.map((m) => (
                    <Grid item xs={12} sm={6} md={3} key={m.id}>
                        <Card
                            sx={{
                                p: 2,
                                position: "relative",
                                minHeight: 260,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            {/* STARTOVNÍ ČÍSLO */}
                            {m.bibNumber && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: -10,
                                        right: -10,
                                        background: "transparent",
                                        color: "black",
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontWeight: "bold",
                                        fontSize: "1.1rem",
                                        border: "2px solid black",
                                        backdropFilter: "blur(4px)",
                                    }}
                                >
                                    #{m.bibNumber}
                                </Box>
                            )}

                            {/* Avatar + jméno */}
                            <Box sx={{ textAlign: "center" }}>
                                <Avatar
                                    src={m.avatarUrl}
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        mx: "auto",
                                        mb: 1,
                                    }}
                                />
                                <Typography variant="h6">{m.name}</Typography>

                                <Chip
                                    label={relationLabel[m.relation]}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                    color={m.relation === "self" ? "primary" : "default"}
                                />
                            </Box>

                            {/* Statusy */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    <strong>Stav platby:</strong>{" "}
                                    {m.paymentStatus === "paid" ? (
                                        <Chip size="small" label="Zaplaceno" color="success" />
                                    ) : (
                                        <Chip size="small" label="Čeká na platbu" color="warning" />
                                    )}
                                </Typography>

                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Stav registrace:</strong> {m.registrationStatus}
                                </Typography>

                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Minulé starty:</strong> {m.pastStarts}
                                </Typography>
                            </Box>

                            {/* Kontakty */}
                            <Box sx={{ mt: 1 }}>
                                {m.email && (
                                    <Typography variant="body2">E-mail: {m.email}</Typography>
                                )}
                                {m.phone && (
                                    <Typography variant="body2">Telefon: {m.phone}</Typography>
                                )}
                            </Box>

                            {/* Psi */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                    Psi se kterými startuje:
                                </Typography>

                                {m.dogs.length > 0 ? (
                                    m.dogs.map((dog) => (
                                        <Chip
                                            key={dog}
                                            size="small"
                                            label={dog}
                                            sx={{ mt: 0.5, mr: 0.5 }}
                                        />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Žádný pes nepřiřazen
                                    </Typography>
                                )}
                            </Box>

                            {/* Akce */}
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    component={Link}
                                    href={`/account/partners/${m.id}`}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    Upravit
                                </Button>

                                {m.relation !== "self" && (
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        fullWidth
                                    >
                                        Odhlásit ze závodu
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}

                {/* + ADD MEMBER BOX */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        component={Link}
                        href="/account/partners/new"
                        sx={{
                            p: 2,
                            minHeight: 260,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed #ccc",
                            cursor: "pointer",
                            "&:hover": {
                                borderColor: "primary.main",
                            },
                        }}
                    >
                        <Typography variant="h6" color="primary">
                            + Přidat člena
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Divider */}
            <Box sx={{ borderBottom: "1px solid #ddd", mt: 4 }} />
        </Box>
    );
}
