import { SpecimenScanner } from "@/components/specimen-scanner";
import Link from "next/link";
import { Activity, Dna, Network, ScanLine } from "lucide-react";
import { getHistoryStats } from "@/lib/api";
import { getGenomeIndex, specimenCount, speciesCount } from "@/lib/genome-index";

function statValue(stats: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = stats[key];
    if (typeof value === "number" || typeof value === "string") {
      return value;
    }
  }

  return "Live";
}

export default async function Home() {
  const index = await getGenomeIndex();
  const stats = await getHistoryStats().catch(() => ({}));

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <ScanLine size={16} />
            GENOME DATABASE
          </div>
          <h1>Normie Genome</h1>
          <p>
            A living atlas for 10,000 on-chain organisms, mapping immutable traits against
            live canvas mutations.
          </p>
          <div className="hero-actions">
            <SpecimenScanner />
            <Link href="/network" className="secondary-link">
              Open Network
            </Link>
          </div>
        </div>
        <div className="hero-terminal" aria-label="Genome database statistics">
          <div className="terminal-row">
            <Dna size={18} />
            <span>{specimenCount(index).toLocaleString()} Specimens Catalogued</span>
          </div>
          <div className="terminal-row">
            <Network size={18} />
            <span>{speciesCount(index)} Known Species</span>
          </div>
          <div className="terminal-row">
            <Activity size={18} />
            <span>{statValue(stats, ["mutationCount", "mutations", "totalMutations"])} Recorded Mutations</span>
          </div>
        </div>
      </section>
    </main>
  );
}

