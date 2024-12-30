"use client";

import * as React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  CardMedia,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import { useState, useEffect } from "react";

interface Milestone {
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  collectedPercentage: number;
}

interface Hero {
  name: string;
  photo: string;
  milestones?: Milestone[];
}

export default function Milestones() {
  const [milestones, setMilestones] = useState<
    (Milestone & { personName: string; personPhoto: string })[]
  >([]);

  useEffect(() => {
    fetch("/data/heros.json")
      .then((response) => response.json())
      .then((data: Hero[]) => {
        const allMilestones = data.flatMap((hero: Hero) =>
          hero.milestones?.map((milestone) => ({
            ...milestone,
            personName: hero.name,
            personPhoto: hero.photo,
          })) || []
        );
        allMilestones.sort((a, b) =>
          b.collectedPercentage - a.collectedPercentage
        );
        setMilestones(allMilestones);
      })
      .catch((error) => {
        console.error("Chyba při načítání dat:", error);
      });
  }, []);

  return (
    <Box id="milestones" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Naše milníky
      </Typography>
      <Typography variant="body1" paragraph>
        V minulém roce jsme společně pořídili handbike pro Elen, letos bychom rádi přispěli na...
      </Typography>

      {milestones.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            backgroundColor: "#fafafa",
            border: "1px dashed #ccc",
            fontStyle: "italic",
            color: "#999",
          }}
        >
          Milníky budou brzy zveřejněny. Děkujeme za trpělivost!
        </Box>
      ) : (
        <Timeline position="alternate">
          {milestones.map((milestone, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot color={milestone.collectedPercentage >= 100 ? "primary" : "secondary"} />
                {index < milestones.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {milestone.title}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {milestone.description}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CardMedia
                      component="img"
                      image={milestone.personPhoto}
                      alt={milestone.personName}
                      sx={{ width: 40, height: 40, borderRadius: "50%", mr: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {milestone.personName}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={milestone.collectedPercentage}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant="body2">
                    {`Vybráno: ${milestone.currentAmount} Kč z ${milestone.targetAmount} Kč`}
                  </Typography>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Box>
  );
}
