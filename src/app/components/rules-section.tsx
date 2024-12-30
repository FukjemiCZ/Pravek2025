"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Definice typů
interface RuleSection {
  title: string;
  rules: string[];
}

interface Rules {
  sections: RuleSection[];
}

export default function RulesSection() {
  const [rules, setRules] = useState<Rules | null>(null); // Přidán typ
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRules() {
      try {
        const response = await fetch("/data/rules.json");
        const data: Rules = await response.json(); // Explicitní typ
        setRules(data);
      } catch (error) {
        console.error("Error loading rules:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  if (loading) {
    return (
      <Box id="pravidla" sx={{ mb: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rules) {
    return (
      <Box id="pravidla" sx={{ mb: 5 }}>
        <Typography variant="h6" color="error">
          Nelze načíst pravidla závodu.
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="pravidla" sx={{ mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Pravidla akce
      </Typography>
      <Typography variant="body1" paragraph>
        Zde uvádíme základní pravidla pro všechny účastníky benefiční akce, rozdělené do několika sekcí:
      </Typography>

      {rules.sections.map((section, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`section-${index}-content`}
            id={`section-${index}-header`}
          >
            <Typography variant="h6">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
              {section.rules.map((rule, ruleIndex) => (
                <li key={ruleIndex}>
                  <Typography variant="body1">{rule}</Typography>
                </li>
              ))}
            </ul>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
