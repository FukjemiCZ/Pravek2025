export function calcMetrics(data: any) {
  const catalog = data?.catalog ?? {};
  const roadmap = data?.roadmap ?? {};
  const ownership = data?.ownership ?? {};
  const heatmap = data?.heatmap ?? {};
  const runtime = data?.runtime ?? {};

  const domains = (catalog.domains ?? []).length;
  const capabilities = (catalog.capabilities ?? []).length;
  const services = (catalog.services ?? []).length;
  const apis = (catalog.apis ?? []).length;
  const events = (catalog.events ?? []).length;

  const epics = (roadmap.epics ?? []).length;

  const flags = runtime.featureFlags ? Object.keys(runtime.featureFlags).length : 0;
  const years = (runtime.years ?? []).length;

  // Missing ownership: simplistic heuristics
  const capOwners = new Map<string, string>();
  for (const c of ownership.capabilities ?? []) capOwners.set(c.id, c.owner);

  const missingCapOwner = (catalog.capabilities ?? []).filter((c: any) => !capOwners.get(c.id)).length;

  // Heatmap coverage: sum of matrix counts
  const coverageCount = (heatmap.matrix ?? []).reduce((acc: number, x: any) => acc + (Number(x.count) || 0), 0);

  return {
    domains,
    capabilities,
    services,
    apis,
    events,
    epics,
    flags,
    years,
    missingCapOwner,
    coverageCount,
  };
}