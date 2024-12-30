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

export default function MilestonesTimeline() {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    // Fetch all milestones data from an API or local JSON file
    fetch("/data/heros.json")
      .then((response) => response.json())
      .then((data) => {
        const allMilestones = data.flatMap((hero) =>
          hero.milestones.map((milestone) => ({
            ...milestone,
            personName: hero.name,
            personPhoto: hero.photo,
          }))
        );
        allMilestones.sort((a, b) =>
          b.collectedPercentage - a.collectedPercentage
        ); // Sort by percentage (completed first)
        setMilestones(allMilestones);
      });
  }, []);

  return (
    <Box id="milestones-timeline" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Naše milníky
      </Typography>
      <Typography variant="body1" paragraph>
        Zde najdete všechny milníky, které podporujeme, seřazené podle splněnosti.
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
