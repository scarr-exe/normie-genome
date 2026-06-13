"use client";

import "@xyflow/react/dist/style.css";

import { ReactFlow, Background, Controls, MiniMap, type NodeMouseHandler } from "@xyflow/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildGenomeGraph } from "@/lib/graph";
import type { GenomeIndex } from "@/lib/types";

type NetworkViewProps = {
  index: GenomeIndex;
  species: string[];
};

export function NetworkView({ index, species }: NetworkViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const graph = useMemo(() => buildGenomeGraph(index, filter, 420), [filter, index]);

  const onNodeClick: NodeMouseHandler = (_, node) => {
    const specimenId = node.data?.specimenId;
    if (typeof specimenId === "string") {
      router.push(`/specimen/${specimenId}`);
    }
  };

  return (
    <section className="network-shell">
      <div className="network-toolbar">
        {["All", ...species].map((name) => (
          <button
            key={name}
            type="button"
            className={filter === name ? "active" : ""}
            onClick={() => setFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="network-canvas">
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          fitView
          onNodeClick={onNodeClick}
          nodesDraggable
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#184f39" gap={24} />
          <MiniMap
            pannable
            zoomable
            style={{ background: "#0e0e12", border: "1px solid #1e1e28" }}
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                Human: "#4ade80", Cat: "#f59e0b", Alien: "#a78bfa", Agent: "#38bdf8"
              };
              const type = (node.data?.traits as Record<string, string>)?.type;
              return colors[type] ?? "#2e2e3e";
            }}
            maskColor="rgba(0,0,0,0.6)"
          />
          <Controls
            style={{
              background: "#0e0e12",
              border: "1px solid #1e1e28",
              boxShadow: "none",
            }}
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </section>
  );
}
