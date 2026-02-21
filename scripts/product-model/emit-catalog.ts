import type { CompiledModel } from "./schema";

export type Catalog = {
  product: {
    id: string;
    name: string;
    type?: string;
    homepage?: string;
    repo?: string;
  };

  runtime: {
    featureFlags: Record<string, boolean>;
    years: Array<{
      id: string;
      label?: string;
      status?: string;
      eventDate?: any;
      gallery?: any;
      pages?: any;
    }>;
  };

  domains: Array<{ id: string; name?: string }>;
  capabilities: Array<{ id: string; domain: string; description?: string }>;
  flows: Array<{ id: string; actor: string; capabilities: string[] }>;
  components: Array<{ id: string; type: string; parent?: string; tech?: string[] }>;
  services: Array<{ id: string; implements: string[] }>;
  apis: Array<{ id: string; endpoints: string[] }>;
  events: Array<{ id: string; producer?: string; consumers?: string[] }>;

  ownership: any;
  roadmap: {
    epics: Array<{
      id: string;
      horizon?: string;
      name?: string;
      outcome?: string;
      capabilities: string[];
      flows: string[];
      kpis?: any[];
      deliverables?: string[];
    }>;
  };
};

export function emitCatalog(model: CompiledModel): Catalog {
  const runtime = model.runtime?.runtime ?? {};
  const ownership = model.ownership?.ownership ?? {};
  const roadmap = model.roadmap?.roadmap ?? {};

  return {
    product: {
      id: model.vision.product.id,
      name: model.vision.product.name,
      type: model.vision.product.type,
      homepage: model.vision.product.homepage,
      repo: model.vision.product.repo
    },

    runtime: {
      featureFlags: runtime.featureFlags ?? {},
      years: runtime.years ?? []
    },

    domains: model.domains.domains,
    capabilities: model.capabilities.capabilities,
    flows: model.flows.flows.map((f) => ({
      id: f.id,
      actor: f.actor,
      capabilities: f.capabilities ?? []
    })),
    components: model.components.components.map((c) => ({
      id: c.id,
      type: c.type,
      parent: c.parent,
      tech: c.tech
    })),
    services: model.services.services.map((s) => ({
      id: s.id,
      implements: s.implements ?? []
    })),
    apis: model.apis.apis.map((a) => ({
      id: a.id,
      endpoints: a.endpoints ?? []
    })),
    events: model.events.events,

    ownership,
    roadmap: {
      epics: (roadmap.epics ?? []).map((e: any) => ({
        id: e.id,
        horizon: e.horizon,
        name: e.name,
        outcome: e.outcome,
        capabilities: e.capabilities ?? [],
        flows: e.flows ?? [],
        kpis: e.kpis,
        deliverables: e.deliverables
      }))
    }
  };
}
