"use client";

import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function GraphView({ relations }: any) {
  const nodes = relations.nodes.map((n: any) => ({
    id: n.id,
    data: { label: n.id },
    position: { x: Math.random() * 500, y: Math.random() * 500 }
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