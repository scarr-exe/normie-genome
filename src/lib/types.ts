export type NormieTraitKey =
  | "type"
  | "gender"
  | "age"
  | "hairStyle"
  | "facialFeature"
  | "eyes"
  | "expression"
  | "accessory";

export type NormieTraits = Record<NormieTraitKey, string>;

export type GenomeIndex = Record<string, NormieTraits>;

export type CanvasInfo = {
  actionPoints?: number;
  action_points?: number;
  level?: number;
  customized?: boolean;
  isCustomized?: boolean;
  delegate?: string | null;
  [key: string]: unknown;
};

export type MutationDiff = {
  changedPixels?: number;
  changed_pixels?: number;
  additions?: number;
  removals?: number;
  [key: string]: unknown;
};

export type MutationVersion = {
  version?: number;
  timestamp?: string;
  blockNumber?: number;
  txHash?: string;
  [key: string]: unknown;
};

export type Persona = {
  name?: string;
  backstory?: string;
  description?: string;
  personality?: string;
  [key: string]: unknown;
};

export type RelativeMatch = {
  id: string;
  score: number;
  traits: NormieTraits;
};

