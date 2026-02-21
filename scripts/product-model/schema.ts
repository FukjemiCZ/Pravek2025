import { z } from "zod";

export const VisionSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string().optional(),
    homepage: z.string().optional(),
    repo: z.string().optional(),
    versioning: z.any().optional()
  }),
  valueProposition: z.array(z.string()).optional(),
  goals: z.any().optional(),
  targetCustomers: z.array(z.string()).optional(),
  personas: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        intent: z.string().optional()
      })
    )
    .optional()
});

export const DomainsSchema = z.object({
  domains: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional()
    })
  )
});

export const CapabilitiesSchema = z.object({
  capabilities: z.array(
    z.object({
      id: z.string(),
      domain: z.string(),
      description: z.string().optional()
    })
  )
});

export const FlowsSchema = z.object({
  flows: z.array(
    z.object({
      id: z.string(),
      actor: z.string(),
      steps: z.array(z.string()).optional(),
      capabilities: z.array(z.string()).optional()
    })
  )
});

export const ComponentsSchema = z.object({
  components: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      type: z.string(),
      tech: z.array(z.string()).optional(),
      parent: z.string().optional(),
      notes: z.string().optional()
    })
  )
});

export const ServicesSchema = z.object({
  services: z.array(
    z.object({
      id: z.string(),
      implements: z.array(z.string()).optional(),
      providedBy: z.array(z.string()).optional(),
      notes: z.string().optional()
    })
  )
});

export const ApisSchema = z.object({
  apis: z.array(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      audience: z.string().optional(),
      endpoints: z.array(z.string()).optional(),
      notes: z.string().optional(),
      data: z.any().optional()
    })
  )
});

export const EventsSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      producer: z.string().optional(),
      consumers: z.array(z.string()).optional()
    })
  )
});

export const SlaSchema = z.object({
  sla: z.record(z.any())
});

export const InfraSchema = z.record(z.any());

export const RelationsSchema = z.object({
  relations: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      type: z.string()
    })
  )
});

/**
 * 12-runtime.yaml (volnější, ale validuje klíčové věci)
 */
export const RuntimeSchema = z.object({
  runtime: z
    .object({
      version: z.number().optional(),
      featureFlags: z.record(z.boolean()).optional(),
      years: z
        .array(
          z.object({
            id: z.string(),
            label: z.string().optional(),
            status: z.string().optional(),
            eventDate: z
              .object({
                from: z.string().optional(),
                to: z.string().optional()
              })
              .optional(),
            gallery: z.any().optional(),
            pages: z.any().optional()
          })
        )
        .optional(),
      cta: z.any().optional(),
      externalEndpoints: z.any().optional(),
      navigation: z.any().optional(),
      locales: z.any().optional()
    })
    .passthrough()
});

/**
 * 13-ownership.yaml
 */
export const OwnershipSchema = z.object({
  ownership: z
    .object({
      version: z.number().optional(),
      teams: z.array(z.any()).optional(),
      domains: z.array(z.any()).optional(),
      capabilities: z.array(z.any()).optional()
    })
    .passthrough()
});

/**
 * 14-roadmap.yaml
 */
export const RoadmapSchema = z.object({
  roadmap: z
    .object({
      version: z.number().optional(),
      horizons: z.array(z.any()).optional(),
      epics: z
        .array(
          z.object({
            id: z.string(),
            horizon: z.string().optional(),
            name: z.string().optional(),
            outcome: z.string().optional(),
            capabilities: z.array(z.string()).optional(),
            flows: z.array(z.string()).optional(),
            kpis: z.array(z.any()).optional(),
            deliverables: z.array(z.string()).optional()
          })
        )
        .optional()
    })
    .passthrough()
});

export type Vision = z.infer<typeof VisionSchema>;
export type Domains = z.infer<typeof DomainsSchema>;
export type Capabilities = z.infer<typeof CapabilitiesSchema>;
export type Flows = z.infer<typeof FlowsSchema>;
export type Components = z.infer<typeof ComponentsSchema>;
export type Services = z.infer<typeof ServicesSchema>;
export type Apis = z.infer<typeof ApisSchema>;
export type Events = z.infer<typeof EventsSchema>;
export type Sla = z.infer<typeof SlaSchema>;
export type Relations = z.infer<typeof RelationsSchema>;
export type Runtime = z.infer<typeof RuntimeSchema>;
export type Ownership = z.infer<typeof OwnershipSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;

export type CompiledModel = {
  vision: Vision;
  domains: Domains;
  capabilities: Capabilities;
  flows: Flows;
  components: Components;
  services: Services;
  apis: Apis;
  events: Events;
  sla: Sla;
  infrastructure: Record<string, any>;
  relations: Relations;

  runtime: Runtime;
  ownership: Ownership;
  roadmap: Roadmap;
};
