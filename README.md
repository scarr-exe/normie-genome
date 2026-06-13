# Normie Genome

A xenobiological database for the Normies collection. Instead of browsing NFT metadata, users explore species, bloodlines, mutations, and genetic relationships through an interactive genome network built on top of the Normies API.

Built for the Normies Hackathon 2025.

---

## What It Is

Normie Genome reframes the Normies collection as a living biological archive. Every Normie is a specimen. Every trait is a genomic marker. Every canvas edit is a mutation event.

The project creates a discovery layer on top of the Normies ecosystem — one that reveals the hidden structure of the collection through real data from the Normies API.

---

## Live Demo

[normie-genome.vercel.app](https://normie-genome.vercel.app)

---

## Features

### Specimen Scanner
Search any of the 10,000 Normies by ID. The scanner pulls live data from the Normies API on every request — canvas state, mutation history, and AI persona are always fresh.

### Genome Analysis
Each specimen receives a computed genome profile derived from on-chain and canvas data:

- **Stability Score** — a 0–100 rating of genomic stability
- **Mutation Class** — classification of the specimen's mutation state
- **Bloodline** — deterministic lineage assignment based on trait signature
- **Activity Level** — classification of canvas engagement

### AI Narrative
Each specimen has a unique narrative pulled live from the Normies agent persona endpoint (`/agents/persona-preview/:id`). This returns a generated backstory, personality, and tagline for every Normie — derived from their traits and canvas state. No external AI API is used.

### Genetic Relatives
The five closest genetic matches for any specimen, computed by weighted trait similarity across the full 10,000-specimen index. Each relative links directly to their own specimen page.

### Mutation History
A chronological record of every canvas transform version for a specimen, sourced from `/history/normie/:id/versions`.

### Genome Network
An interactive graph visualising the full collection as a biological taxonomy:

```
Species (4 nodes)
  └── Trait Clusters (grouped by age + type + hair)
        └── Specimens (individual nodes)
```

Filter by species. Click any specimen node to open their genome page.

---

## How the Genome System Works

### Genome Index

Before the app serves any requests, a one-time build script (`scripts/build-index.ts`) crawls the Normies API at a rate of 50 requests per minute and fetches trait data for all 10,000 specimens. The output is `data/genome-index.json` — a flat map of token ID to trait object.

```json
{
  "284": {
    "type": "Human",
    "gender": "Male",
    "age": "Old",
    "hairStyle": "Stringy Hair",
    "facialFeature": "Luxurious Beard",
    "eyes": "Small Shades",
    "expression": "Slight Smile",
    "accessory": "Bandana"
  }
}
```

Traits are immutable on-chain. The index never needs to regenerate. All similarity computation runs against this local cache — making genetic relative matching instant without hitting the API rate limit.

Live API calls fire on every specimen page load for data that can change: canvas info, mutation diff, transform history, and agent persona.

---

### Stability Score

The stability score (0–100) measures how genomically stable a specimen is. It is derived from three live canvas values:

```
pixelFactor  = (pixelCount / 800) × 70     // up to 70 points
levelBonus   = min(canvasLevel × 0.5, 20)  // up to 20 points
penalty      = min(actionPoints × 0.05, 30) // up to 30 points deducted

stabilityScore = clamp(pixelFactor + levelBonus - penalty, 10, 100)
```

**pixelCount** — the number of active pixels in the current canvas state, sourced from the mutation diff endpoint. A fully drawn specimen scores higher.

**canvasLevel** — the specimen's current canvas progression level. Higher level adds a small bonus, reflecting accumulated on-chain activity.

**actionPoints** — the total number of edit operations the holder has performed. Heavy editing reduces stability, representing genomic drift from the original mint state. The penalty is capped at 30 so even heavily edited specimens retain a minimum score.

The minimum score is 10 — no specimen registers as completely unstable.

| Score | Label |
|-------|-------|
| 85–100 | Apex Stable |
| 70–84 | Stable |
| 50–69 | Fluctuating |
| 30–49 | Unstable |
| 10–29 | Critical |

---

### Mutation Class

Mutation class categorises the specimen's current state of genomic change. It is derived from canvas level, customisation status, and the combined intensity of action points and changed pixels.

```
intensity = actionPoints + changedPixels
```

| Condition | Mutation Class |
|-----------|---------------|
| Level 0, not customised | Dormant |
| Level 1–2 | Early Mutation |
| Level 3–5, intensity < 64 | Active Mutation |
| Customised, intensity ≥ 96 | {Type} Variant |
| Customised, intensity ≥ 180 | {Type} Overwrite |
| Customised, intensity ≥ 500+ (extreme) | {Type} Singularity |

The `{Type}` prefix uses the specimen's species — so a heavily mutated Alien reads as "Alien Singularity" rather than a generic label.

---

### Action Points

Action points are sourced directly from the Normies canvas API (`/normie/:id/canvas/info`). They represent the total number of pixel edit operations a holder has performed on their Normie's canvas.

Most specimens have zero action points — they are untouched since mint. A non-zero value means the holder has actively engaged with the canvas system.

| Action Points | Activity Label |
|---------------|---------------|
| 0 | Dormant |
| 1–50 | Low Activity |
| 51–200 | Active |
| 201–500 | High Activity |
| 500+ | Apex Mutant |

Specimen #0 currently holds 1,188 action points — one of the most actively mutated specimens in the collection.

---

### Bloodline

Bloodline is a deterministic classification assigned to each specimen based on their trait signature. It does not change unless traits change (which they cannot — traits are immutable on-chain).

The bloodline is computed by hashing three trait values — eyes, expression, and accessory — and mapping the result to a species-specific bloodline list:

```ts
hash = reduce(eyes + expression + accessory, charCode × 31)
bloodline = speciesBloodlines[hash % bloodlines.length]
```

| Species | Bloodlines |
|---------|------------|
| Human | Terran, Elder, Wanderer, Ironborn |
| Cat | Shadowpaw, Goldmane, Voidwhisker, Stormfur |
| Alien | Plasma, Void, Stellar, Chrono |
| Agent | Protocol, Cipher, Nexus, Phantom |

Two specimens with identical eyes, expression, and accessory will always share a bloodline — which is why it surfaces in the genetic relatives panel as a meaningful connection marker.

---

### Genetic Relative Matching

Relative matching uses a weighted trait similarity score across all 10,000 specimens in the genome index. For any target specimen, every other specimen is scored and the top 5 are returned.

```
score = Σ (traitWeight if traits match)
```

| Trait | Weight |
|-------|--------|
| Type (species) | 40 |
| Eyes | 15 |
| Expression | 15 |
| Accessory | 10 |
| Hair Style | 10 |
| Facial Feature | 3.3 |
| Gender | 3.4 |
| Age | 3.3 |

Species is weighted heavily because two specimens of different types cannot be close genetic relatives in the xenobiological framing — an Alien and a Human share no common lineage. Eyes and expression are weighted next because they are the most visually distinctive traits.

The maximum possible score is 100 (identical specimen, excluded from results). A score of 87 means seven of the eight trait categories match.

---

## API Usage

All data comes from the Normies API (`https://api.normies.art`). The app uses the following endpoints:

| Endpoint | Usage | When Called |
|----------|-------|-------------|
| `/normie/:id/traits` | Trait data for genome index | Build time (one-time) |
| `/normie/:id/image.svg` | Specimen pixel art | Every specimen page load |
| `/normie/:id/canvas/info` | Level, action points, customisation status | Every specimen page load |
| `/normie/:id/canvas/diff` | Changed pixel count | Every specimen page load |
| `/history/normie/:id/versions` | Mutation transform history | Every specimen page load |
| `/agents/persona-preview/:id` | AI-generated name, backstory, personality | Every specimen page load |
| `/history/stats` | Collection-wide mutation statistics | Landing page load |

The genome index is built using the traits endpoint at 50 requests per minute (safely within the 60/min rate limit). All other endpoints are called live at runtime — so canvas state, mutations, and personas are always current.

---

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **@xyflow/react** — genome network graph
- **lucide-react** — icons
- **Normies API** — all collection data

---

## Running Locally

```bash
git clone https://github.com/scarrxt/normie-genome
cd normie-genome
npm install
npm run dev
```

The repo includes the pre-built `data/genome-index.json`. You do not need to run the index builder unless you want to regenerate it.

To rebuild the genome index from scratch:

```bash
npx tsx scripts/build-index.ts
```

This will take approximately 3 hours to crawl all 10,000 specimens at the safe rate limit.

---

## Project Structure

```
normie-genome/
├── data/
│   └── genome-index.json       # pre-built trait index for all 10k specimens
├── scripts/
│   └── build-index.ts          # one-time genome index builder
└── src/
    ├── app/
    │   ├── page.tsx             # landing page
    │   ├── specimen/[id]/
    │   │   └── page.tsx         # specimen genome page
    │   └── network/
    │       └── page.tsx         # genome network visualisation
    ├── components/
    │   ├── live-field.tsx       # data display component
    │   ├── network-view.tsx     # React Flow network graph
    │   ├── specimen-image.tsx   # SVG specimen renderer
    │   └── specimen-scanner.tsx # ID search input
    └── lib/
        ├── api.ts               # all Normies API calls
        ├── genome.ts            # scoring, mutation class, relative matching
        ├── genome-index.ts      # index loader with sample fallback
        ├── graph.ts             # network graph builder
        └── types.ts             # shared TypeScript types
```

---

## Hackathon Category

**Visualization / Art**

Normie Genome creates a discovery layer on top of the Normies collection — transforming raw NFT metadata into a navigable xenobiological archive. The genome network is the centrepiece: a live graph that reveals the species, bloodline, and mutation structure of all 10,000 specimens in a single view.
#   n o r m i e - g e n o m e  
 