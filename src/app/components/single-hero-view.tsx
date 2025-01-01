"use client";

import * as React from "react";
import {
  Box,
  Typography,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useState } from "react";
import Image from "next/image";

// Typ pro hrdinu
interface Hero {
  name: string;
  story: string;
  gallery: string[];
}

interface SingleHeroViewProps {
  hero: Hero;
}

export default function SingleHeroView({ hero }: SingleHeroViewProps) {
  const [openGallery, setOpenGallery] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const openImageDialog = (index: number) => {
    setCurrentImage(index);
    setOpenGallery(true);
  };

  const closeImageDialog = () => {
    setOpenGallery(false);
  };

  const handleNextImage = () => {
    setCurrentImage((prev) => (prev + 1) % hero.gallery.length);
  };

  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev - 1 + hero.gallery.length) % hero.gallery.length);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {hero.name}
      </Typography>
      <Typography variant="body1" paragraph>
        {hero.story}
      </Typography>

      <Typography variant="h5" gutterBottom>
        Galerie
      </Typography>
      <ImageList cols={isMobile ? 2 : 3} gap={8}>
        {hero.gallery.map((image, index) => (
          <ImageListItem key={index} onClick={() => openImageDialog(index)}>
            <Image
              src={image}
              alt={`Gallery image ${index + 1}`}
              width={300}
              height={200}
              style={{ borderRadius: "8px", cursor: "pointer" }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog open={openGallery} onClose={closeImageDialog}>
        <DialogTitle>
          <IconButton onClick={closeImageDialog} sx={{ position: "absolute", top: 0, right: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <IconButton onClick={handlePrevImage}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Image
            src={hero.gallery[currentImage]}
            alt="Current image"
            width={800}
            height={600}
            style={{ maxWidth: "100%" }}
          />
          <IconButton onClick={handleNextImage}>
            <ArrowForwardIosIcon />
          </IconButton>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
