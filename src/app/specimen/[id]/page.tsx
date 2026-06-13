import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Dna, History, Microscope, Network } from "lucide-react";
import {
  getCanvasInfo,
  getMutationDiff,
  getMutationHistory,
  getPersona
} from "@/lib/api";
import { LiveField } from "@/components/live-field";
import { SpecimenImage } from "@/components/specimen-image";
import { getGenomeIndex } from "@/lib/genome-index";
import {
  actionPoints,
  activityLabel,
  bloodline,
  canvasLevel,
  changedPixelCount,
  findRelatives,
  isCustomized,
  mutationClass,
  stabilityScore
} from "@/lib/genome";

type SpecimenPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SpecimenPage({ params }: SpecimenPageProps) {
  const { id } = await params;
  const index = await getGenomeIndex();
  const traits = index[id];

  if (!traits) {
    notFound();
  }

  const [canvasInfo, mutationDiff, history, persona] = await Promise.all([
    getCanvasInfo(id).catch(() => null),
    getMutationDiff(id).catch(() => null),
    getMutationHistory(id).catch(() => []),
    getPersona(id).catch(() => null)
  ]);

  const changedPixels = changedPixelCount(mutationDiff);
  const stability = stabilityScore(canvasInfo, changedPixels || 800);
  const relatives = findRelatives(id, index, 5);
  const narrative =
    persona?.backstory ??
    persona?.description ??
    persona?.personality ??
    "Persona signal unavailable. The organism remains silent in the tank.";

  return (
    <main className="specimen-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Genome Database
      </Link>

      <section className="specimen-hero">
        <SpecimenImage id={id} />
        <div className="specimen-header">
          <span className="eyebrow">
            <Microscope size={16} />
            SPECIMEN #{id}
          </span>
          <h1>{traits.type} / {traits.expression}</h1>
          <p>
            Immutable trait signature cross-referenced with live Canvas telemetry and
            AI persona residue.
          </p>
          <div className="metric-grid">
            <LiveField label="Stability" value={`${stability}%`} />
            <LiveField label="Mutation" value={mutationClass(canvasInfo, traits, mutationDiff)} />
            <LiveField label="Canvas Level" value={canvasLevel(canvasInfo)} />
            <LiveField label="Action Points" value={actionPoints(canvasInfo)} />
            <LiveField label="Bloodline" value={bloodline(traits)} />
            <LiveField label="Activity" value={activityLabel(actionPoints(canvasInfo))} />
          </div> 
        </div>
      </section>

      <section className="data-grid">
        <article className="panel">
          <h2>
            <Dna size={18} />
            Classification
          </h2>
          <dl className="trait-list">
            {Object.entries(traits).map(([key, value]) => (
              <div key={key}>
                <dt>{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="panel">
          <h2>
            <Microscope size={18} />
            Genome Analysis
          </h2>
          <div className="analysis-readout">
            <LiveField label="Customized" value={isCustomized(canvasInfo) ? "Yes" : "No"} />
            <LiveField label="Changed Pixels" value={changedPixels} />
            <LiveField label="Delegate" value={
              !canvasInfo?.delegate || canvasInfo.delegate === "0x0000000000000000000000000000000000000000"
                ? "None"
                : `${String(canvasInfo.delegate).slice(0, 6)}...${String(canvasInfo.delegate).slice(-4)}`
            } />
          </div>
        </article>

        <article className="panel narrative-panel">
          <h2>AI Narrative</h2>
          <p>{String(narrative)}</p>
        </article>

        <article className="panel">
          <h2>
            <History size={18} />
            Mutation History
          </h2>
          {history.length > 0 ? (
            <ol className="history-list">
              {history.slice(0, 6).map((version, indexPosition) => (
                <li key={`${version.version ?? indexPosition}`}>
                  <span>Version {String(version.version ?? indexPosition)}</span>
                  <small>{String(version.timestamp ?? version.txHash ?? "On-chain record")}</small>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">No transform versions detected.</p>
          )}
        </article>

        <article className="panel relatives-panel">
          <h2>
            <Network size={18} />
            Genetic Relatives
          </h2>
          <div className="relative-list">
            {relatives.map((match) => (
              <Link href={`/specimen/${match.id}`} key={match.id}>
                <span>#{match.id}</span>
                <strong>{match.score}%</strong>
                <small>{match.traits.type} / {match.traits.eyes}</small>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

