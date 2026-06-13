import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NetworkView } from "@/components/network-view";
import { getGenomeIndex } from "@/lib/genome-index";

export default async function NetworkPage() {
  const index = await getGenomeIndex();
  const species = Array.from(new Set(Object.values(index).map((traits) => traits.type))).sort();

  return (
    <main className="network-page">
      <div className="page-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Genome Database
        </Link>
        <div>
          <span className="eyebrow">GENOME NETWORK</span>
          <h1>Trait Cluster Map</h1>
        </div>
      </div>
      <NetworkView index={index} species={species} />
    </main>
  );
}

