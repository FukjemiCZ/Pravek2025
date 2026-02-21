import type { CompiledModel } from "./schema";
import { slugifyId } from "./utils";

export type Heatmap = {
  domains: Array<{ id: string; name?: string }>;
  epics: Array<{ id: string; name?: string; horizon?: string }>;
  matrix: Array<{
    domainId: string;
    epicId: string;
    count: number;
    capabilities: string[];
  }>;
};

export function emitHeatmap(model: CompiledModel): Heatmap {
  const domains = model.domains.domains.map((d) => ({ id: d.id, name: d.name }));
  const epics = (model.roadmap.roadmap.epics ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    horizon: e.horizon
  }));

  // capId -> domainId
  const capDomain = new Map<string, string>();
  for (const c of model.capabilities.capabilities) {
    capDomain.set(slugifyId(c.id), slugifyId(c.domain));
  }

  // matrix map domain->epic
  const cell = new Map<string, { count: number; capabilities: Set<string> }>();

  for (const e of model.roadmap.roadmap.epics ?? []) {
    const epicId = slugifyId(e.id);
    for (const cap of e.capabilities ?? []) {
      const capId = slugifyId(cap);
      const domainId = capDomain.get(capId);
      if (!domainId) continue;

      const key = `${domainId}::${epicId}`;
      if (!cell.has(key)) cell.set(key, { count: 0, capabilities: new Set<string>() });

      const c = cell.get(key)!;
      c.count += 1;
      c.capabilities.add(cap);
    }
  }

  const matrix = [...cell.entries()].map(([key, v]) => {
    const [domainId, epicId] = key.split("::");
    return {
      domainId,
      epicId,
      count: v.count,
      capabilities: [...v.capabilities].sort()
    };
  });

  // zajisti deterministické pořadí
  matrix.sort((a, b) =>
    (a.domainId + "::" + a.epicId).localeCompare(b.domainId + "::" + b.epicId)
  );

  return { domains, epics, matrix };
}
