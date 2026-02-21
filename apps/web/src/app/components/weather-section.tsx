"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";

interface DayForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
}

export default function WeatherSection() {
  const [forecast, setForecast] = useState<DayForecast[]>([]);

  useEffect(() => {
    async function fetchWeather() {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=50.5617&longitude=15.1603&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Prague&start_date=2026-05-15&end_date=2026-05-17"
      );

      const data = await res.json();

      const dates = data.daily.time;
      const max = data.daily.temperature_2m_max;
      const min = data.daily.temperature_2m_min;
      const rain = data.daily.precipitation_sum;

      const output: DayForecast[] = dates.map((d: string, i: number) => ({
        date: d,
        tempMin: min[i],
        tempMax: max[i],
        precipitation: rain[i],
      }));

      setForecast(output);
    }

    fetchWeather();
  }, []);

  return (
    <Card sx={{ minHeight: 250 }}>
      <CardContent>
        <Typography variant="h6">Počasí na závod</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          15. – 17. května 2026
        </Typography>

        {forecast.length === 0 ? (
          <Typography>Načítám předpověď…</Typography>
        ) : (
          forecast.map((day) => (
            <Box
              key={day.date}
              sx={{
                py: 1,
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #eee",
              }}
            >
              <Typography>{day.date}</Typography>

              <Typography>
                {day.tempMin}°C – {day.tempMax}°C
              </Typography>

              <Chip
                label={`${day.precipitation} mm`}
                color={day.precipitation > 0 ? "info" : "success"}
                size="small"
              />
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}
