// ./src/app/components/sumary-section.tsx
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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Image from "next/image";

interface Beneficiary {
  name: string;
  subtitle: string;
  description: string;
  dialogText: string;
  image: string;
}

interface SummaryData {
  year: string;
  amount: string;
  beneficiaries: Beneficiary[];
  mapImages: string[];
}

interface SummariesResponse {
  summaries: SummaryData[];
}

export default function SummarySection() {
  const [data, setData] = React.useState<SummariesResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [openBeneficiaryDialog, setOpenBeneficiaryDialog] = React.useState<
    Record<string, boolean>
  >({});
  const [openMapDialog, setOpenMapDialog] = React.useState<Record<string, boolean>>(
    {}
  );

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/summary");
        if (!res.ok) {
          throw new Error(`Network response was not ok. Status: ${res.status}`);
        }
        const json: SummariesResponse = await res.json();
        setData(json);
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error("Chyba při fetchování summary:", e.message);
        } else {
          console.error("Chyba při fetchování summary (neznámý typ):", e);
        }
        setError("Nepodařilo se načíst data. Zkuste to prosím znovu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenBeneficiaryDialog = (year: string, benIdx: number) => {
    const key = `${year}-${benIdx}`;
    setOpenBeneficiaryDialog((prev) => ({ ...prev, [key]: true }));
  };
  const handleCloseBeneficiaryDialog = (year: string, benIdx: number) => {
    const key = `${year}-${benIdx}`;
    setOpenBeneficiaryDialog((prev) => ({ ...prev, [key]: false }));
  };

  const handleOpenMapDialog = (year: string, mapIdx: number) => {
    const key = `${year}-map-${mapIdx}`;
    setOpenMapDialog((prev) => ({ ...prev, [key]: true }));
  };
  const handleCloseMapDialog = (year: string, mapIdx: number) => {
    const key = `${year}-map-${mapIdx}`;
    setOpenMapDialog((prev) => ({ ...prev, [key]: false }));
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data?.summaries || data.summaries.length === 0) {
    return null;
  }

  // Seřadíme rok sestupně (nejnovější jako první, nejstarší jako poslední)
  const sortedSummaries = data.summaries
    .slice()
    .sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <Box>
      {sortedSummaries.map((summary) => (
        <Box
          key={summary.year}
          id={`summary${summary.year}`}
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light" ? "#F3F4F6" : "#1A2027",
            py: 5,
            position: "relative",
            overflow: "hidden",
            mb: 8,
          }}
        >
          <CheckCircleIcon
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 400,
              color: "rgba(0, 128, 0, 0.6)",
              zIndex: 0,
            }}
          />

          <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Shrnutí ročníku {summary.year}
            </Typography>
            <Typography variant="h5" sx={{ textAlign: "center", my: 2 }}>
              Vybraná částka: {summary.amount}
            </Typography>

            {summary.beneficiaries.map((ben, idx) => {
              const dialogKey = `${summary.year}-${idx}`;
              const isOpenDialog = !!openBeneficiaryDialog[dialogKey];
              return (
                <Box
                  key={dialogKey}
                  sx={{
                    textAlign: "center",
                    my: 4,
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Box sx={{ flexShrink: 0, width: { xs: "100%", md: "45%" } }}>
                    <Image
                      src={ben.image}
                      alt={ben.name}
                      width={450}
                      height={300}
                      style={{
                        borderRadius: "8px",
                        width: "100%",
                        height: "auto",
                      }}
                      sizes="(max-width: 600px) 300px, 450px"
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {ben.subtitle}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      {ben.description}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
                      P. S. život je skvělej, tak ho, prosím, ŽIJ naplno♥️!
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      {ben.name}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() =>
                        handleOpenBeneficiaryDialog(summary.year, idx)
                      }
                    >
                      Více o {ben.name}
                    </Button>
                  </Box>

                  <Dialog
                    open={isOpenDialog}
                    onClose={() =>
                      handleCloseBeneficiaryDialog(summary.year, idx)
                    }
                    maxWidth="sm"
                    fullWidth
                  >
                    <DialogTitle>
                      {ben.name}
                      <IconButton
                        aria-label="close"
                        onClick={() =>
                          handleCloseBeneficiaryDialog(summary.year, idx)
                        }
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
                          src={ben.image}
                          alt={ben.name}
                          width={300}
                          height={200}
                          style={{
                            borderRadius: "8px",
                            width: "100%",
                            maxWidth: "300px",
                            height: "auto",
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{ mt: 2, whiteSpace: "pre-line" }}
                        >
                          {ben.dialogText}
                        </Typography>
                      </Box>
                    </DialogContent>
                  </Dialog>
                </Box>
              );
            })}

            {summary.mapImages.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Mapa trasy
                </Typography>
                <ImageList
                  cols={2}
                  gap={8}
                  sx={{
                    display: { xs: "block", md: "grid" },
                    gridTemplateColumns: { md: "repeat(2, 1fr)" },
                    justifyItems: "center",
                  }}
                >
                  {summary.mapImages.map((src, mapIdx) => {
                    const mapKey = `${summary.year}-map-${mapIdx}`;
                    const isOpenMap = !!openMapDialog[mapKey];
                    return (
                      <React.Fragment key={mapKey}>
                        <ImageListItem
                          sx={{ width: { xs: "100%", md: "30%" } }}
                        >
                          <Image
                            src={src}
                            alt={`Mapa ${mapIdx + 1} (rok ${summary.year})`}
                            width={300}
                            height={200}
                            style={{
                              cursor: "pointer",
                              borderRadius: "8px",
                              width: "100%",
                              height: "auto",
                            }}
                            onClick={() =>
                              handleOpenMapDialog(summary.year, mapIdx)
                            }
                          />
                        </ImageListItem>

                        <Dialog
                          open={isOpenMap}
                          onClose={() =>
                            handleCloseMapDialog(summary.year, mapIdx)
                          }
                          maxWidth="md"
                          fullWidth
                        >
                          <DialogTitle>
                            Detail mapy (rok {summary.year})
                            <IconButton
                              aria-label="close"
                              onClick={() =>
                                handleCloseMapDialog(summary.year, mapIdx)
                              }
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
                            <Image
                              src={src}
                              alt={`Detail mapy ${mapIdx + 1}`}
                              width={800}
                              height={600}
                              style={{ width: "100%", borderRadius: "8px" }}
                            />
                          </DialogContent>
                        </Dialog>
                      </React.Fragment>
                    );
                  })}
                </ImageList>
              </Box>
            )}
          </Container>
        </Box>
      ))}
    </Box>
  );
}
