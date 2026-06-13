import type { Edge, Node } from "@xyflow/react";
import type { GenomeIndex } from "./types";

export type GenomeGraph = {
  nodes: Node[];
  edges: Edge[];
};

const SPECIES_COLORS: Record<string, string> = {
  Human: "#4ade80",
  Cat: "#f59e0b",
  Alien: "#a78bfa",
  Agent: "#38bdf8",
};

export function buildGenomeGraph(
  index: GenomeIndex,
  species = "All",
  sampleSize = 320,
): GenomeGraph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const entries = Object.entries(index)
    .filter(([, traits]) => species === "All" || traits.type === species)
    .slice(0, sampleSize);

  const speciesNames = Array.from(
    new Set(Object.values(index).map((traits) => traits.type)),
  ).sort();

  for (const [speciesIndex, type] of speciesNames.entries()) {
    if (species !== "All" && species !== type) continue;

    nodes.push({
      id: `type-${type}`,
      type: "input",
      position: { x: speciesIndex * 380, y: 0 },
      data: { label: type },
      style: {
        background: SPECIES_COLORS[type] ?? "#6b7280",
        color: "#000",
        border: "none",
        borderRadius: "4px",
        padding: "12px 24px",
        fontWeight: 700,
        fontSize: "16px",
        width: 160,
      },
    });
  }

  const clusterPositions = new Map<string, number>();

  for (const [id, traits] of entries) {
    const color = SPECIES_COLORS[traits.type] ?? "#6b7280";
    const cluster = `${traits.age} + ${traits.type} + ${traits.hairStyle}`;
    const clusterId = `cluster-${cluster}`;
    const typeId = `type-${traits.type}`;

    if (!clusterPositions.has(clusterId)) {
      clusterPositions.set(clusterId, clusterPositions.size);
      const indexPosition = clusterPositions.size - 1;

      nodes.push({
        id: clusterId,
        position: {
          x: (indexPosition % 8) * 260,
          y: 180 + Math.floor(indexPosition / 8) * 190,
        },
        data: { label: cluster },
        style: {
          background: "#1a1a2e",
          color: color,
          border: `1px solid ${color}`,
          borderRadius: "4px",
          fontSize: "11px",
          padding: "6px 10px",
          width: 140,
        },
      });

      edges.push({
        id: `${typeId}-${clusterId}`,
        source: typeId,
        target: clusterId,
        animated: true,
      });
    }

    const specimenPosition = Number(id) % 11;

    nodes.push({
      id: `specimen-${id}`,
      position: {
        x:
          ((clusterPositions.get(clusterId) ?? 0) % 8) * 260 +
          specimenPosition * 18,
        y:
          300 +
          Math.floor((clusterPositions.get(clusterId) ?? 0) / 8) * 190 +
          specimenPosition * 10,
      },
      data: { label: `#${id}`, specimenId: id },
      style: {
        background: color,
        border: "none",
        borderRadius: "50%",
        width: 12,
        height: 12,
        minWidth: 12,
        fontSize: "0px",
      },
    });

    edges.push({
      id: `${clusterId}-specimen-${id}`,
      source: clusterId,
      target: `specimen-${id}`,
    });
  }

  return { nodes, edges };
}
