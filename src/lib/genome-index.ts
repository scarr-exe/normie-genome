import sampleIndex from "../../data/genome-index.sample.json";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { GenomeIndex } from "./types";

let fullIndex: GenomeIndex | null = null;

export async function getGenomeIndex(): Promise<GenomeIndex> {
  if (fullIndex) {
    return fullIndex;
  }

  try {
    const content = await readFile(join(process.cwd(), "data/genome-index.json"), "utf8");
    fullIndex = JSON.parse(content) as GenomeIndex;
    return fullIndex;
  } catch {
    return sampleIndex as GenomeIndex;
  }
}

export function specimenCount(index: GenomeIndex) {
  return Object.keys(index).length;
}

export function speciesCount(index: GenomeIndex) {
  return new Set(Object.values(index).map((traits) => traits.type)).size;
}
