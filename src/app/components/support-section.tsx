"use client";

import * as React from "react";
import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import Image from "next/image";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Typy
interface Milestone {
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  collectedPercentage: number;
}

interface Hero {
  id: string;
  story: string;
  gallery: string[];
  milestones?: Milestone[];
}

export default function SingleHeroView({ hero }: { hero?: Hero }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openGallery, setOpenGallery] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const openImageDialog = (index: number) => {
    setCurrentImage(index);
    setOpenGallery(true);
  };

  const closeImageDialog = () => {
    setOpenGallery(false);
  };

  const handleNextImage = () => {
    if (!hero) return;
    setCurrentImage((prev) => (prev + 1) % hero.gallery.length);
  };

  const handlePrevImage = () => {
    if (!hero) return;
    setCurrentImage((prev) => (prev - 1 + hero.gallery.length) % hero.gallery.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      handleNextImage();
    } else if (event.key === "ArrowLeft") {
      handlePrevImage();
    }
  };

  if (!hero) {
    return <Typography variant="body1">Žádný hrdina k zobrazení</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="Hero details tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="Příběh" />
        <Tab label="Galerie" />
        <Tab label="Milníky" />
      </Tabs>

      {selectedTab === 0 && (
        <Box>
          {hero.story.split("\n").map((paragraph, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 2 }}>
              {paragraph}
            </Typography>
          ))}
        </Box>
      )}

      {selectedTab === 1 && hero.gallery?.length > 0 && (
        <>
          <ImageList cols={isMobile ? 2 : 3} gap={8}>
            {hero.gallery.map((image, index) => (
              <ImageListItem
                key={index}
                onClick={() => openImageDialog(index)}
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <Image
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  loading="lazy"
                  style={{ borderRadius: "8px" }}
                />
              </ImageListItem>
            ))}
          </ImageList>

          <Dialog
            open={openGallery}
            onClose={closeImageDialog}
            maxWidth="lg"
            onKeyDown={handleKeyDown}
            sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <DialogTitle sx={{ position: "absolute", top: 0, right: 0 }}>
              <IconButton
                edge="end"
                color="inherit"
                onClick={closeImageDialog}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              sx={{
                position: "relative",
                width: "80vw",
                height: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                onClick={handlePrevImage}
                sx={{ position: "absolute", left: 10, zIndex: 1 }}
              >
                <ArrowBackIosNewIcon fontSize="large" />
              </IconButton>
              <Image
                src={hero.gallery[currentImage]}
                alt="Current gallery image"
                style={{ maxHeight: "100%", maxWidth: "100%", borderRadius: "12px" }}
              />
              <IconButton
                onClick={handleNextImage}
                sx={{ position: "absolute", right: 10, zIndex: 1 }}
              >
                <ArrowForwardIosIcon fontSize="large" />
              </IconButton>
            </DialogContent>
          </Dialog>
        </>
      )}

      {selectedTab === 2 && hero.milestones && hero.milestones.length > 0 && (
        <Timeline position="alternate">
          {hero.milestones.map((milestone, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot
                  color={milestone.collectedPercentage >= 100 ? "success" : "grey"}
                >
                  {milestone.collectedPercentage >= 100 ? (
                    <CheckCircleIcon />
                  ) : (
                    <AttachMoneyIcon />
                  )}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Card sx={{ maxWidth: 400, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {milestone.title}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {milestone.description}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={milestone.collectedPercentage || 0}
                      sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color={
                        milestone.collectedPercentage >= 100
                          ? "green"
                          : "text.secondary"
                      }
                    >
                      {milestone.collectedPercentage >= 100
                        ? `Milník splněn: ${milestone.currentAmount} Kč (${milestone.collectedPercentage} %)`
                        : `Vybráno: ${milestone.currentAmount} Kč z ${milestone.targetAmount} Kč`}
                    </Typography>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Box>
  );
}
