import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z, ErrorSchema } from "./shared";

export const registryArchitectureUi = new OpenAPIRegistry();

registryArchitectureUi.register("Error", ErrorSchema);

// /api/status
const StatusResponseSchema = registryArchitectureUi.register(
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

registryArchitectureUi.registerPath({
  method: "get",
  path: "/api/status",
  tags: ["architecture-ui"],
  description: "UptimeRobot proxy + aggregated overall status",
  responses: {
    200: { description: "OK", content: { "application/json": { schema: StatusResponseSchema } } },
    500: { description: "Failure", content: { "application/json": { schema: ErrorSchema } } },
  },
});

// /api/product-model
const ProductModelResponseSchema = registryArchitectureUi.register(
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

registryArchitectureUi.registerPath({
  method: "get",
  path: "/api/product-model",
  tags: ["architecture-ui"],
  description: "Unified product-model dataset proxy (GitHub Pages source)",
  responses: {
    200: { description: "OK", content: { "application/json": { schema: ProductModelResponseSchema } } },
    500: { description: "Failure", content: { "application/json": { schema: ErrorSchema } } },
  },
});