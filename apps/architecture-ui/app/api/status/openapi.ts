import { z } from "zod";

export const openapi = {
  method: "get",
  path: "/api/status",
  tags: ["architecture-ui"],
  summary: "UptimeRobot proxy + aggregated overall status",
  description:
    "Server-side proxy to UptimeRobot. Returns aggregated overall status plus raw monitor list and raw API response.",
  responses: {
    200: z.object({
      overall: z.enum(["up", "down"]),
      monitors: z.array(
        z.object({
          id: z.number(),
          friendly_name: z.string(),
          status: z.number(), // UptimeRobot status codes: 2=up, 0=paused, 8/9=down-ish
        })
      ),
      raw: z.any(),
    }),
    500: z.object({
      error: z.string(),
      detail: z.string().optional(),
    }),
  },
} as const;