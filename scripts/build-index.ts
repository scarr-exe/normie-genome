import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { normalizeTraits } from "../src/lib/genome";
import type { GenomeIndex } from "../src/lib/types";

const API_BASE_URL = "https://api.normies.art";
const TOTAL_SUPPLY = 10_000;
const REQUESTS_PER_MINUTE = 60;
const DELAY_MS = Math.ceil(60_000 / REQUESTS_PER_MINUTE);
const OUTPUT_PATH = resolve(process.cwd(), "data/genome-index.json");
const MAX_ATTEMPTS = 6;

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function retryDelay(status: number | null, attempt: number) {
  if (status === 429) {
    return 65_000;
  }

  return Math.min(60_000, 2 ** attempt * 2_000);
}

async function loadExistingIndex(): Promise<GenomeIndex> {
  try {
    const content = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(content) as GenomeIndex;
    console.log(`Resuming from ${Object.keys(parsed).length}/${TOTAL_SUPPLY} cached specimens`);
    return parsed;
  } catch {
    return {};
  }
}

async function saveIndex(index: GenomeIndex) {
  await writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2));
}

function shouldRefreshCachedTraits(id: number, index: GenomeIndex) {
  const traits = index[String(id)];

  return !traits || traits.type === "Unknown";
}

async function fetchTraits(id: number) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/normie/${id}/traits`);

      if (response.ok) {
        return normalizeTraits((await response.json()) as Record<string, unknown>);
      }

      if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_ATTEMPTS) {
        throw new Error(`#${id} failed with ${response.status}`);
      }

      const waitMs = retryDelay(response.status, attempt);
      console.warn(
        `#${id} returned ${response.status}; retrying in ${Math.round(waitMs / 1000)}s (${attempt}/${MAX_ATTEMPTS})`
      );
      await sleep(waitMs);
    } catch (error) {
      lastError = error;

      if (attempt === MAX_ATTEMPTS) {
        break;
      }

      const waitMs = retryDelay(null, attempt);
      console.warn(
        `#${id} request failed; retrying in ${Math.round(waitMs / 1000)}s (${attempt}/${MAX_ATTEMPTS})`
      );
      await sleep(waitMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`#${id} failed after retries`);
}

async function buildIndex() {
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  const index = await loadExistingIndex();

  for (let id = 0; id < TOTAL_SUPPLY; id += 1) {
    if (!shouldRefreshCachedTraits(id, index)) {
      continue;
    }

    index[String(id)] = await fetchTraits(id);

    if (id % 25 === 0) {
      await saveIndex(index);
      console.log(`Indexed ${id + 1}/${TOTAL_SUPPLY}`);
    }

    if (id < TOTAL_SUPPLY - 1) {
      await sleep(DELAY_MS);
    }
  }

  await saveIndex(index);
  console.log(`Genome index written to ${OUTPUT_PATH}`);
}

buildIndex().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
