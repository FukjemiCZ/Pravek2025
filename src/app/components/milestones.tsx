"use client";

import * as React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useState, useEffect } from "react";

export default function MilestonesTimeline() {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    fetch("/data/heroshh.json")
      .then((response) => response.json())
      .then((data) => {
        const allMilestones = data.flatMap((hero) =>
          hero.milestones?.map((milestone) => ({
            ...milestone,
            personName: hero.name,
            personPhoto: hero.photo,
          })) || []
        );
        allMilestones.sort((a, b) => b.collectedPercentage - a.collectedPercentage);
        setMilestones(allMilestones);
      })
      .catch(() => {
        setMilestones([]);
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
                <TimelineDot
                  color={milestone.collectedPercentage >= 100 ? "success" : "grey"}
                >
                  {milestone.collectedPercentage >= 100 ? (
                    <CheckCircleIcon />
                  ) : (
                    <AttachMoneyIcon />
                  )}
                </TimelineDot>
                {index < milestones.length - 1 && <TimelineConnector />}
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
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CardMedia
                        component="img"
                        image={milestone.personPhoto}
                        alt={milestone.personName}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          mr: 2,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {milestone.personName}
                      </Typography>
                    </Box>
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
