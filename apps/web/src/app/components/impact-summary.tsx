"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { EVENT_CONFIG } from "@/app/event-config";
import type { SummaryData } from "@/app/types/summary";

type ImpactSummaryVariant = "