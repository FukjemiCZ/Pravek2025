export function buildGraph(catalog: any) {
  const nodes: any[] = [];
  const edges: any[] = [];

  catalog.domains?.forEach((d: any) => {
    nodes.push({
      id: d.id,
      type: "domain",
      position: { x: 0, y: 0 },
      data: { label: d.id },
    });
  });

  catalog.capabilities?.forEach((c: any) => {
    nodes.push({
      id: c.id,
      type: "capability",
      position: { x: 0, y: 0 },
      data: { label: c.id },
    });

    edges.push({
      id: `${c.id}-${c.domain}`,
      source: c.domain,
      target: c.id,
    });
  });

  return { nodes, edges };
}