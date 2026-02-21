"use client";

import { List, ListItem, ListItemText, Typography } from "@mui/material";

export default function ServicesSection({ services }: any) {
  return (
    <>
      <Typography variant="h5" sx={{ mt: 4 }}>
        Services
      </Typography>
      <List>
        {services?.map((s: any) => (
          <ListItem key={s.id}>
            <ListItemText
              primary={s.id}
              secondary={`Implements: ${s.implements?.join(", ")}`}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}