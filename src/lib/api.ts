import type { CanvasInfo, MutationDiff, MutationVersion, Persona } from "./types";

export const API_BASE_URL = "https://api.normies.art";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getSpecimenImage(id: string | number) {
  return `${API_BASE_URL}/normie/${id}/image.svg`;
}

export function getHistoricalImage(id: string | number, version: string | number) {
  return `${API_BASE_URL}/history/normie/${id}/version/${version}/image.svg`;
}

export async function getCanvasInfo(id: string | number): Promise<CanvasInfo> {
  return apiFetch<CanvasInfo>(`/normie/${id}/canvas/info`);
}

export async function getMutationDiff(id: string | number): Promise<MutationDiff> {
  return apiFetch<MutationDiff>(`/normie/${id}/canvas/diff`);
}

export async function getMutationHistory(id: string | number): Promise<MutationVersion[]> {
  const data = await apiFetch<MutationVersion[] | { versions?: MutationVersion[] }>(
    `/history/normie/${id}/versions`
  );

  return Array.isArray(data) ? data : data.versions ?? [];
}

export async function getPersona(id: string | number): Promise<Persona> {
  return apiFetch<Persona>(`/agents/persona-preview/${id}`);
}

export async function getHistoryStats(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/history/stats", {
    next: { revalidate: 120 },
    cache: "force-cache"
  });
}
