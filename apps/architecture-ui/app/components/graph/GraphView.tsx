"use client";

import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function GraphView({ relations }: any) {
  const nodes = relations.nodes.map((n: any, i: number) => ({
    id: n.id,
    data: { label: n.id },
    position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 150 }
  }));

  const edges = relations.edges.map((e: any, i: number) => ({
    id: "e" + i,
    source: e.from,
    target: e.to
  }));

  return (
    <div style={{ height: 600 }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}