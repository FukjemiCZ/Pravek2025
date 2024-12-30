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
    ImageList,
    ImageListItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Image from 'next/image';

export default function SummarySection() {
    const [openElenDialog, setOpenElenDialog] = React.useState(false);
    const [openMapDialog, setOpenMapDialog] = React.useState(false);
    const [selectedMapImage, setSelectedMapImage] = React.useState<string | null>(null);

    const handleOpenElenDialog = () => setOpenElenDialog(true);
    const handleCloseElenDialog = () => setOpenElenDialog(false);

    const handleOpenMapDialog = (image: string) => {
        setSelectedMapImage(image);
        setOpenMapDialog(true);
    };

    const handleCloseMapDialog = () => {
        setSelectedMapImage(null); // Resetujeme hodnotu zpět na null
        setOpenMapDialog(false);
    };

    return (
        <Box
            id="summary2024"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === "light" ? "#F3F4F6" : "#1A2027",
                py: 5,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Ikona na popředí */}
            <CheckCircleIcon
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: 400, // Velikost ikony
                    color: "rgba(0, 128, 0, 0.6)", // Zelená barva s větší průhledností
                    zIndex: 10, // Nejvyšší zIndex
                }}
            />

            <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Shrnutí ročníku 2024
                </Typography>

                <Typography variant="h5" sx={{ textAlign: "center", my: 2 }}>
                    Vybraná částka: 250,800 Kč
                </Typography>

                {/* Elen Section */}
                <Box sx={{ textAlign: "center", my: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 4 }}>
                    <Image
                        src="/img/final.jpeg"
                        alt="Elen"
                        style={{
                            borderRadius: "8px",
                            width: "100%",
                            maxWidth: "450px",
                        }}
                        sizes="(max-width: 600px) 300px, 450px"
                    />
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Podpořili jsme Elen
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Elen Koškové je 18 let a studuje Sociální činnost. Miluje cestování, sport a překonávání překážek. Navzdory životu se svalovou dystrofií se snaží zůstat aktivní. Ráda by si pořídila elektrický handbike, který dokáže dobře ovládat, aby si mohla užít svět a být nezávislá na pomoci druhých. Vaše podpora jí pomůže splnit tento sen. Elen je za jakoukoliv pomoc nesmírně vděčná.
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
                            P. S. život je skvělej, tak ho, prosím, ŽIJ naplno♥️!
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Elen
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={handleOpenElenDialog}
                        >
                            Více o Elen
                        </Button>
                    </Box>
                </Box>

                {/* Map Images */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Mapa trasy
                    </Typography>
                    <ImageList cols={2} gap={8} sx={{
                        display: { xs: "block", md: "grid" },
                        gridTemplateColumns: { md: "repeat(2, 1fr)" },
                        justifyItems: "center"
                    }}>
                        {[
                            "/img/mapa2024.jpg",
                            "/img/mapa2024_a.jpg"
                        ].map((src, index) => (
                            <ImageListItem key={index} sx={{ width: { xs: "100%", md: "30%" } }}>
                                <Image
                                    src={src}
                                    alt={`Mapa ${index + 1}`}
                                    style={{ cursor: "pointer", borderRadius: "8px", width: "100%", height: "auto" }}
                                    onClick={() => handleOpenMapDialog(src)}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Box>

                {/* Elen Dialog */}
                <Dialog
                    open={openElenDialog}
                    onClose={handleCloseElenDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Elen
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseElenDialog}
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
                        <Box sx={{ textAlign: "center" }}>
                            <Image
                                src="/img/final.jpeg"
                                alt="Elen"
                                style={{ borderRadius: "8px", width: "100%", maxWidth: "300px" }}
                            />
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                {`Jmenuji se Elena Košková. Je mi 18 let a studuji Sociální činnost. Miluju cestování, sport, pomáhání druhým lidem, boření stereotypů a překonávání svých hranic. 
    Už odmalička svůj život sdílím se svalovou dystrofií. Často je to boj, ale stojí za to! 
    Čím jsem starší, tak se můj zdravotní stav zhoršuje, vyžaduje neustále větší množství terapií a operací. Existuje spousta kompenzačních pomůcek nebo rehabilitací, které mi pomáhají udržovat zdravotní stav, či by pomohly žít aktivnější život, ale pojišťovna je často nehradí a já si je finančně nemohu dovolit. 
    Kromě rehabilitací, pomáhá pohyb jako takový, proto se snažím sportovat, a tak bych si moc ráda pořídila elektrický handbike, který i se svým omezením dokážu dobře ovládat. 
    Abych se mohla pohybovat venku s kamarády, nezávisle na pomoci někoho jiného, mě teď čeká pořízení přídavného pohonu k vozíku. Což se pojí k mému cíli: žít život naplno a být co nejvíc samostatná. 
    Chtěla bych všem moc poděkovat za jakoukoliv podporu. Ohromně si jí vážím. A doufám, že se chopím příležitosti a podaří se mi pomoct zase někomu jinému. 
    P. S. život je skvělej, tak ho, prosím, ŽIJ naplno♥️! 
    Elen`.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </Typography>
                        </Box>
                    </DialogContent>
                </Dialog>

                {/* Map Dialog */}
                <Dialog
                    open={openMapDialog}
                    onClose={handleCloseMapDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        Detail mapy
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseMapDialog}
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
                        {selectedMapImage && (
                            <Image
                                src={selectedMapImage}
                                alt="Detail mapy"
                                style={{ width: "100%", borderRadius: "8px" }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}
