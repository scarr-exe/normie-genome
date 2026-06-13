import type {
  CanvasInfo,
  GenomeIndex,
  MutationDiff,
  NormieTraits,
  RelativeMatch,
} from "./types";

const SIMILARITY_WEIGHTS: Array<[keyof NormieTraits, number]> = [
  ["type", 40],
  ["eyes", 15],
  ["expression", 15],
  ["accessory", 10],
  ["hairStyle", 10],
  ["gender", 3.4],
  ["age", 3.3],
  ["facialFeature", 3.3],
];

const MAX_EXPECTED_PIXELS = 800;

export function normalizeTraitKey(key: string): keyof NormieTraits | null {
  const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, keyof NormieTraits> = {
    type: "type",
    gender: "gender",
    age: "age",
    hairstyle: "hairStyle",
    hair: "hairStyle",
    facialfeature: "facialFeature",
    facial: "facialFeature",
    eyes: "eyes",
    expression: "expression",
    accessory: "accessory",
  };

  return map[normalized] ?? null;
}

export function normalizeTraits(input: Record<string, unknown>): NormieTraits {
  const traits: Partial<NormieTraits> = {};
  const entries = Array.isArray(input.attributes)
    ? input.attributes
        .filter(
          (attribute): attribute is { trait_type: unknown; value: unknown } => {
            return (
              typeof attribute === "object" &&
              attribute !== null &&
              "trait_type" in attribute &&
              "value" in attribute
            );
          },
        )
        .map(
          (attribute) =>
            [String(attribute.trait_type), attribute.value] as const,
        )
    : Object.entries(input);

  for (const [key, value] of entries) {
    const normalized = normalizeTraitKey(key);
    if (normalized) {
      traits[normalized] = String(value);
    }
  }

  return {
    type: traits.type ?? "Unknown",
    gender: traits.gender ?? "Unknown",
    age: traits.age ?? "Unknown",
    hairStyle: traits.hairStyle ?? "Unknown",
    facialFeature: traits.facialFeature ?? "Unknown",
    eyes: traits.eyes ?? "Unknown",
    expression: traits.expression ?? "Unknown",
    accessory: traits.accessory ?? "None",
  };
}

export function canvasLevel(canvasInfo?: CanvasInfo | null): number {
  const value = Number(canvasInfo?.level ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function actionPoints(canvasInfo?: CanvasInfo | null): number {
  const value = Number(
    canvasInfo?.actionPoints ?? canvasInfo?.action_points ?? 0,
  );
  return Number.isFinite(value) ? value : 0;
}

export function isCustomized(canvasInfo?: CanvasInfo | null): boolean {
  return Boolean(canvasInfo?.customized ?? canvasInfo?.isCustomized ?? false);
}

export function changedPixelCount(diff?: MutationDiff | null): number {
  const candidates = [
    diff?.changedPixels,
    diff?.changed_pixels,
    Number(diff?.additions ?? 0) + Number(diff?.removals ?? 0),
  ];

  const value = candidates.find((candidate) =>
    Number.isFinite(Number(candidate)),
  );
  return Number(value ?? 0);
}

export function stabilityScore(
  canvasInfo: CanvasInfo | null | undefined,
  pixelCount: number,
): number {
  const editCount = actionPoints(canvasInfo);
  const pixelFactor = (pixelCount / MAX_EXPECTED_PIXELS) * 70;
  const penalty = Math.min(editCount * 0.05, 30);
  const levelBonus = Math.min(canvasLevel(canvasInfo) * 0.5, 20);
  const raw = pixelFactor + levelBonus - penalty;

  return Math.max(10, Math.min(100, Math.round(raw)));
}

export function mutationClass(
  canvasInfo: CanvasInfo | null | undefined,
  traits?: NormieTraits,
  diff?: MutationDiff | null,
): string {
  const level = canvasLevel(canvasInfo);
  const edited = isCustomized(canvasInfo);
  const intensity = actionPoints(canvasInfo) + changedPixelCount(diff);

  if (level === 0 && !edited) {
    return "Dormant";
  }

  if (level >= 1 && level <= 2) {
    return "Early Mutation";
  }

  if (level >= 3 && level <= 5 && (!edited || intensity < 64)) {
    return "Active Mutation";
  }

  const type = traits?.type ?? "Normie";

  if (intensity >= 180) {
    return `${type} Singularity`;
  }

  if (intensity >= 96) {
    return `${type} Overwrite`;
  }

  return `${type} Variant`;
}

export function similarityScore(a: NormieTraits, b: NormieTraits): number {
  const score = SIMILARITY_WEIGHTS.reduce((total, [key, weight]) => {
    return total + (a[key] === b[key] ? weight : 0);
  }, 0);

  return Math.round(score);
}

export function findRelatives(
  targetId: string | number,
  index: GenomeIndex,
  topN = 5,
): RelativeMatch[] {
  const id = String(targetId);
  const target = index[id];

  if (!target) {
    return [];
  }

  return Object.entries(index)
    .filter(([candidateId]) => candidateId !== id)
    .map(([candidateId, traits]) => ({
      id: candidateId,
      score: similarityScore(target, traits),
      traits,
    }))
    .sort((a, b) => b.score - a.score || Number(a.id) - Number(b.id))
    .slice(0, topN);
}

const BLOODLINES: Record<string, string[]> = {
  Human: ["Terran", "Elder", "Wanderer", "Ironborn"],
  Cat: ["Shadowpaw", "Goldmane", "Voidwhisker", "Stormfur"],
  Alien: ["Plasma", "Void", "Stellar", "Chrono"],
  Agent: ["Protocol", "Cipher", "Nexus", "Phantom"],
};

export function bloodline(traits: NormieTraits): string {
  const lines = BLOODLINES[traits.type] ?? ["Unknown"];
  const hash = `${traits.eyes}${traits.expression}${traits.accessory}`
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) & 0xffff, 0);
  return lines[hash % lines.length];
}

export function activityLabel(points: number): string {
  if (points === 0) return "Dormant";
  if (points <= 50) return "Low Activity";
  if (points <= 200) return "Active";
  if (points <= 500) return "High Activity";
  return "Apex Mutant";
}
