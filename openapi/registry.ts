import { z } from "zod";
import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const ErrorSchema = registry.register(
  "Error",
  z.object({
    error: z.string(),
    detail: z.string().optional(),
  })
);

// 3) Example: architecture-ui endpoints (ty máš existující)
// /api/status
export const StatusResponseSchema = registry.register(
  "StatusResponse",
  z.object({
    overall: z.enum(["up", "down"]).optional(),
    monitors: z
      .array(
        z.object({
          id: z.number(),
          friendly_name: z.string(),
          status: z.number(),
        })
      )
      .optional(),
    raw: z.any().optional(),
  })
);

registry.registerPath({
  method: "get",
  path: "/api/status",
  description: "UptimeRobot proxy + aggregated overall status",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: StatusResponseSchema,
        },
      },
    },
    500: {
      description: "Failure",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// /api/product-model
export const ProductModelResponseSchema = registry.register(
  "ProductModelResponse",
  z.object({
    catalog: z.any(),
    runtime: z.any(),
    roadmap: z.any(),
    ownership: z.any(),
    heatmap: z.any(),
    compiled: z.any().optional(),
  })
);

registry.registerPath({
  method: "get",
  path: "/api/product-model",
  description: "Unified product-model dataset proxy (GitHub Pages source)",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: ProductModelResponseSchema,
        },
      },
    },
    500: {
      description: "Failure",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});