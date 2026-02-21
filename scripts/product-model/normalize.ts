import { slugifyId } from "./utils";
import type { CompiledModel } from "./schema";

type Index = {
  domains: Set<string>;
  personas: Set<string>;
  capabilities: Set<string>;
  flows: Set<string>;
  components: Set<string>;
  services: Set<string>;
  apis: Set<string>;
  events: Set<string>;
};

function makeIndex(m: CompiledModel): Index {
  return {
    domains: new Set(m.domains.domains.map((d) => slugifyId(d.id))),
    personas: new Set((m.vision.personas ?? []).map((p) => slugifyId(p.id))),
    capabilities: new Set(m.capabilities.capabilities.map((c) => slugifyId(c.id))),
    flows: new Set(m.flows.flows.map((f) => slugifyId(f.id))),
    components: new Set(m.components.components.map((c) => slugifyId(c.id))),
    services: new Set(m.services.services.map((s) => slugifyId(s.id))),
    apis: new Set(m.apis.apis.map((a) => slugifyId(a.id))),
    events: new Set(m.events.events.map((e) => slugifyId(e.id)))
  };
}

export type NormalizationIssue = {
  level: "error" | "warn";
  code: string;
  message: string;
};

export function normalizeAndValidate(model: CompiledModel) {
  const issues: NormalizationIssue[] = [];
  const idx = makeIndex(model);

  // Validate capability domain
  for (const cap of model.capabilities.capabilities) {
    const did = slugifyId(cap.domain);
    if (!idx.domains.has(did)) {
      issues.push({
        level: "error",
        code: "CAP_DOMAIN_MISSING",
        message: `Capability '${cap.id}' references unknown domain '${cap.domain}'.`
      });
    }
  }

  // Validate flows actor and referenced capabilities
  for (const f of model.flows.flows) {
    const aid = slugifyId(f.actor);
    if (model.vision.personas?.length) {
      if (!idx.personas.has(aid)) {
        issues.push({
          level: "warn",
          code: "FLOW_ACTOR_UNKNOWN",
          message: `Flow '${f.id}' actor '${f.actor}' not found in personas.`
        });
      }
    }
    for (const cid of f.capabilities ?? []) {
      if (!idx.capabilities.has(slugifyId(cid))) {
        issues.push({
          level: "error",
          code: "FLOW_CAP_UNKNOWN",
          message: `Flow '${f.id}' references unknown capability '${cid}'.`
        });
      }
    }
  }

  // Validate relations endpoints
  const allIds = new Set<string>([
    ...idx.domains,
    ...idx.personas,
    ...idx.capabilities,
    ...idx.flows,
    ...idx.components,
    ...idx.services,
    ...idx.apis,
    ...idx.events
  ]);

  for (const r of model.relations.relations) {
    if (!allIds.has(slugifyId(r.from))) {
      issues.push({
        level: "warn",
        code: "REL_FROM_UNKNOWN",
        message: `Relation from '${r.from}' not found in any layer.`
      });
    }
    if (!allIds.has(slugifyId(r.to))) {
      issues.push({
        level: "warn",
        code: "REL_TO_UNKNOWN",
        message: `Relation to '${r.to}' not found in any layer.`
      });
    }
  }

  return {
    model,
    issues,
    index: idx
  };
}
