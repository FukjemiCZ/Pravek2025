"use client";

import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import { Box, Typography } from "@mui/material";

export default function GraphSection({ relations }: any) {
  const nodes = relations?.nodes ?? [];
  const edges = relations?.edges ?? [];

  return (
    <>
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Architecture Graph
      </Typography>

      <Box sx={{ height: 500, border: "1px solid #eee", borderRadius: 2 }}>
        <ReactFlow nodes={nodes} edges={edges} fitView />
      </Box>
    </>
  );
}