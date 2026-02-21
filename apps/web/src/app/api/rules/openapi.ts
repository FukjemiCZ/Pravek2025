import { z } from "zod";

export const openapi = {
  method: "get",
  path: "/api/rules",
  tags: ["web"],
  summary: "GET /api/rules",
  description: "TODO: describe this endpoint.",
  // Optional: request schemas
  // request: {
  //   query: z.object({}),
  //   params: z.object({}),
  //   body: z.object({}),
  // },
  responses: {
    200: z.any(),
    500: z.object({ error: z.string(), detail: z.string().optional() }),
  },
} as const;
