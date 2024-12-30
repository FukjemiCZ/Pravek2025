"use client";

import * as React from "react";
import {
    Box,
    Button,
    Container,
    Typography,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
} from "@mui/material";
import SupportDialog from "./support-dialog";
import CloseIcon from "@mui/icons-material/Close";
import NavigationIcon from "@mui/icons-material/Navigation";

// Definice typu pro účastníka
interface Participant {
    name: string;
    registration_order: number;
    dogs: string[];
    paid: boolean;
}

export default function HeroSection() {
    const [participants, setParticipants] = React.useState<Participant[]>([]);
    const [raisedAmount, setRaisedAmount] = React.useState(0);
    const [openSupportDialog, setOpenSupportDialog] = React.useState(false);
    const [openParticipantsDialog, setOpenParticipantsDialog] = React.useState(false);
    const [isRegistrationFull, setIsRegistrationFull] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const capacity = 49;

    const today = new Date();
    const showNavigateButton = today > new Date("2025-05-12");
    const isRegistrationOpen = today >= new Date("2025-01-01T13:30:00");
    const isPayOpen = today >= new Date("2025-03-01");

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const responseAmount = await fetch("/data/vybrano.json");
                const dataAmount = await responseAmount.json();
                setRaisedAmount(dataAmount.amount);

                const responseParticipants = await fetch("/data/racers.json");
                const dataParticipants: Participant[] = await responseParticipants.json();

                const sortedData = dataParticipants.sort(
                    (a, b) => a.registration_order - b.registration_order
                );
                const mainParticipants = sortedData.slice(0, capacity);

                setParticipants(mainParticipants);
                setIsRegistrationFull(mainParticipants.length >= capacity);
            } catch (error) {
                console.error("Chyba při načítání dat:", error);
            }
        };
        fetchData();
    }, []);

    const handleOpenSupportDialog = () => setOpenSupportDialog(true);
    const handleCloseSupportDialog = () => setOpenSupportDialog(false);

    const handleOpenParticipantsDialog = () => setOpenParticipantsDialog(true);
    const handleCloseParticipantsDialog = () => setOpenParticipantsDialog(false);

    const handleRegistration = () => {
        window.open("https://prihlaseni.pravek-v-raji.cz/", "_blank");
    };

    const handleNavigate = () => {
        window.open("https://mapy.cz/s/heremuteza", "_blank");
    };

    const filteredParticipants = participants.filter((participant) =>
        participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box
            id="home"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === "light" ? "#E6F7FF" : "#2C3E50",
                textAlign: "center",
                py: 5,
                px: 2,
            }}
        >
            <Container maxWidth="md">
                <Typography variant="h3" component="h1" gutterBottom>
                    Benefiční dogtrekking Pravěk v Ráji 2025
                </Typography>
                <Typography variant="h6" gutterBottom>
                    15. - 18. května 2025 &nbsp;|&nbsp; Fotbalové hřiště Vyskeř
                </Typography>

                {raisedAmount > 0 && (
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ mt: 3, cursor: "pointer" }}
                    >
                        Vybráno: {raisedAmount.toLocaleString("cs-CZ")} Kč
                    </Typography>
                )}

                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ m: 1 }}
                        onClick={handleOpenSupportDialog}
                        disabled={!isPayOpen}
                    >
                        {isPayOpen
                            ? "Podpořit"
                            : "Možnosti plateb spouštíme 1.3.2024"}
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ m: 1 }}
                        onClick={handleRegistration}
                        disabled={!isRegistrationOpen || isRegistrationFull}
                    >
                        {isRegistrationOpen
                            ? isRegistrationFull
                                ? "Startovka plná"
                                : "Registrace závodníka"
                            : "Registrace otevřeme 1.1.2024 ve 13:30"}
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ m: 1 }}
                        onClick={handleOpenParticipantsDialog}
                    >
                        Startovka
                    </Button>

                    {showNavigateButton && (
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ m: 1 }}
                            onClick={handleNavigate}
                            startIcon={<NavigationIcon />}
                        >
                            Navigovat
                        </Button>
                    )}
                </Box>
            </Container>

            <SupportDialog open={openSupportDialog} onClose={handleCloseSupportDialog} />

            <Dialog
                open={openParticipantsDialog}
                onClose={handleCloseParticipantsDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Seznam závodníků
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseParticipantsDialog}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                        Hledat závodníka
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                        <TextField
                            label="Jméno závodníka"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            fullWidth
                        />
                    </Box>

                    <Typography variant="h5" gutterBottom>
                        Startovka ({participants.length}/{capacity})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {filteredParticipants.map((participant, index) => (
                            <Box
                                key={index}
                                sx={{
                                    flex: "1 1 calc(50% - 16px)",
                                    backgroundColor: participant.paid ? "#e8f5e9" : "#ffebee",
                                    borderRadius: 2,
                                    padding: 2,
                                }}
                            >
                                <Typography variant="h6">{participant.name}</Typography>
                                <Typography variant="body2">
                                    Psi: {participant.dogs.join(", ")}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "bold", mt: 1 }}
                                >
                                    Stav platby: {participant.paid ? "Uhrazeno" : "Neuhrazeno"}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
