"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type ApiGalleryRow = {
  name: string;
  position: number;
  gallery: string;
  zobrazovat: string; // "ANO" / "NE"
  src: string;
};

type GalleryImage = { src: string; alt?: string };

function isAno(v: string) {
  const s = (v || "").trim().toLowerCase();
  return s === "ano" || s === "yes" || s === "true" || s === "1";
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Neznámá chyba";
  }
}

export type GalleryProps = {
  /**
   * Filtr nad sloupcem `gallery` v Sheets.
   * - string: jeden název (např. "Eliska")
   * - string[]: více názvů (např. ["Eliska","Honza"])
   * - null/undefined/[]: bez filtru => všechny fotky
   */
  galleries?: string | string[] | null;

  /**
   * Jestli se mají zobrazit i položky se `zobrazovat = NE`.
   * Default: false (tj. běžné chování – nezobrazuje).
   */
  includeHidden?: boolean;

  /**
   * Pokud chceš omezit počet fotek (např. jen teaser).
   * Default: bez limitu.
   */
  limit?: number;

  /**
   * Volitelný nadpis / wrapper text.
   */
  title?: string;

  /**
   * Layout volby
   */
  gap?: number; // default 12

  /**
   * Poměr thumbnail dlaždice (sjednocení mřížky).
   * Default "4 / 5"
   */
  tileAspectRatio?: string;

  /**
   * Když chceš změnit objectFit pro thumb (default: "cover")
   */
  thumbObjectFit?: "cover" | "contain";
};

export default function Gallery({
  galleries = null,
  includeHidden = false,
  limit,
  title,
  gap = 12,
  tileAspectRatio = "4 / 5",
  thumbObjectFit = "cover",
}: GalleryProps) {
  const [rows, setRows] = useState<ApiGalleryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // fullscreen viewer
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // Mobile-first: 2 sloupce na mobilu, 3 na sm+, 4 na md+
  const cols = isMdUp ? 4 : isSmUp ? 3 : 2;

  const normalizedGalleries: string[] | null = useMemo(() => {
    if (galleries == null) return null;
    if (Array.isArray(galleries)) {
      const cleaned = galleries.map((g) => g.trim()).filter(Boolean);
      return cleaned.length ? cleaned : null;
    }
    const single = galleries.trim();
    return single ? [single] : null;
  }, [galleries]);

  // Načti data z API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // API umí server-side filtr jen pro jednu gallery přes ?gallery=
        // Pokud chceme více galerií nebo "all", stáhneme vše a filtrujeme na FE.
        const canServerFilterOne =
          normalizedGalleries && normalizedGalleries.length === 1;

        const url = canServerFilterOne
          ? `/api/gallery?gallery=${encodeURIComponent(normalizedGalleries[0])}`
          : `/api/gallery`;

        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
          const payload: unknown = await res.json().catch(() => ({}));
          const message =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof (payload as { error?: unknown }).error === "string"
              ? (payload as { error: string }).error
              : `API error (${res.status})`;
          throw new Error(message);
        }

        const data: unknown = await res.json();
        const images =
          typeof data === "object" &&
          data !== null &&
          "images" in data &&
          Array.isArray((data as { images?: unknown }).images)
            ? ((data as { images: ApiGalleryRow[] }).images ?? [])
            : [];

        if (!cancelled) setRows(images);
      } catch (err: unknown) {
        if (!cancelled) {
          setRows([]);
          setError(getErrorMessage(err) || "Chyba při načítání galerie.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [normalizedGalleries]);

  const images: GalleryImage[] = useMemo(() => {
    let out = rows.slice();

    // FE filtr: podle galleries (více hodnot)
    if (normalizedGalleries && normalizedGalleries.length) {
      const set = new Set(normalizedGalleries.map((g) => g.toLowerCase()));
      out = out.filter((r) => set.has((r.gallery || "").toLowerCase()));
    }

    // FE filtr: skryté
    if (!includeHidden) {
      out = out.filter((r) => isAno(r.zobrazovat));
    }

    // Řazení
    out.sort((a, b) => (a.position ?? 999999) - (b.position ?? 999999));

    // Limit
    if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
      out = out.slice(0, limit);
    }

    return out.map((r) => ({ src: r.src, alt: r.name }));
  }, [rows, normalizedGalleries, includeHidden, limit]);

  const openViewer = useCallback((index: number) => {
    setActiveIndex(index);
    setOpen(true);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => {
      const len = images.length;
      if (len <= 1) return 0;
      return (i - 1 + len) % len;
    });
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => {
      const len = images.length;
      if (len <= 1) return 0;
      return (i + 1) % len;
    });
  }, [images.length]);

  // activeIndex drž v mezích
  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0);
  }, [activeIndex, images.length]);

  // keyboard in fullscreen
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, prev, next]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <CircularProgress size={22} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ color: "error.main" }}>
        Galerie se nepodařila načíst: {error}
      </Typography>
    );
  }

  if (!images.length) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      {title ? (
        <Typography sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
      ) : null}

      <ImageList cols={cols} gap={gap} sx={{ m: 0, px: { xs: 0, sm: 0 } }}>
        {images.map((img, idx) => (
          <ImageListItem
            key={img.src}
            onClick={() => openViewer(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openViewer(idx);
            }}
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
              aspectRatio: tileAspectRatio,
              bgcolor: "rgba(0,0,0,0.04)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
              "&:focus-visible": {
                outline: "3px solid rgba(25,118,210,0.6)",
                outlineOffset: "2px",
              },
            }}
            title="Klikni pro zobrazení na celou obrazovku"
          >
            <Image
              src={img.src}
              alt={img.alt ?? ""}
              fill
              sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
              style={{ objectFit: thumbObjectFit }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      {/* Fullscreen viewer */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: "rgba(0,0,0,0.92)" } }}
      >
        <Box sx={{ position: "relative", width: "100vw", height: "100vh" }}>
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Zavřít"
            sx={{
              position: "absolute",
              zIndex: 4,
              top: 12,
              right: 12,
              color: "white",
              bgcolor: "rgba(255,255,255,0.14)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.20)" },
            }}
          >
            <CloseIcon />
          </IconButton>

          {images.length > 1 && (
            <>
              <IconButton
                onClick={prev}
                aria-label="Předchozí fotografie"
                sx={{
                  position: "absolute",
                  zIndex: 4,
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.14)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.20)" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={next}
                aria-label="Další fotografie"
                sx={{
                  position: "absolute",
                  zIndex: 4,
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.14)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.20)" },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}

          {images[activeIndex] && (
            <Box sx={{ position: "absolute", inset: 0 }}>
              <Image
                src={images[activeIndex].src}
                alt={images[activeIndex].alt ?? ""}
                fill
                sizes="100vw"
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
