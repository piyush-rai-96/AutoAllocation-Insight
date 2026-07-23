import { useState } from 'react'
import { ExternalLink, Sparkles, Layers, Boxes, TrendingUp, Scale, ChevronDown } from 'lucide-react'

/*
 * ScenarioEvaluator
 * -----------------
 * A neutral, non-prescriptive decision-support overview — no verdict, no CTAs.
 *
 * Design intent (Lead UI/UX Designer / Senior FE):
 *   PART 1  Individual Scenario Overviews — operational blueprint only (no financials).
 *   PART 2  AI Allocation Brief — a narrative, executive-brief-style report with
 *           themed icon-led sections, bulleted insights, suggestions, and a closing.
 *
 * Neutral Scenario 1 / Scenario 2 identifiers only. Color is reserved for the
 * brief's accents — everything else stays clean and scannable.
 *
 * Stack note: this project ships plain JSX + Tailwind + lucide-react (no TypeScript,
 * no shadcn/ui). The primitives below are dependency-free and styled to match the
 * shadcn aesthetic so the component runs as-is.
 */

// Section-icon registry for the AI brief.
const briefIcons = { strategy: Layers, inventory: Boxes, recovery: TrendingUp, tradeoff: Scale }

// Renders inline **bold** and _italic_ markers within a brief string.
function RichText({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
  return parts.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900">{seg.slice(2, -2)}</strong>
    }
    if (seg.startsWith('_') && seg.endsWith('_')) {
      return <em key={i} className="italic text-indigo-700">{seg.slice(1, -1)}</em>
    }
    return <span key={i}>{seg}</span>
  })
}

// A themed brief section: colored icon + label, then bulleted insights.
function BriefSection({ icon, title, bullets }) {
  const Icon = briefIcons[icon] || Layers
  return (
    <div>
      <p className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-indigo-600">
        <Icon className="h-4 w-4" /> {title}
      </p>
      <ul className="space-y-2.5">
        {bullets.map((b, k) => (
          <li key={k} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300" />
            <span><RichText text={b} /></span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// A neutral section header with an eyebrow index + divider underline.
function SectionHead({ index, title, sub }) {
  return (
    <div className="mb-4 border-b border-slate-200 pb-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Part {index}</p>
      <h3 className="mt-0.5 text-base font-extrabold tracking-tight text-slate-900">{title}</h3>
      {sub && <p className="mt-0.5 text-[13px] text-slate-500">{sub}</p>}
    </div>
  )
}

// Column identifier chip — strictly neutral "Scenario N".
function ScenarioTag({ n }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
      <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-500 text-[10px] font-extrabold text-white">{n}</span>
      Scenario {n}
    </span>
  )
}

export default function ScenarioEvaluator({ data, onOpenCompare }) {
  const plans = data.scenarios
  const brief = data.executiveBrief
  const [insightOpen, setInsightOpen] = useState(false)

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* ══ PART 1 · Individual Scenario Overviews ══════════════════════ */}
      <section>
        <SectionHead index="1" title="Individual Scenario Overviews" sub="How each scenario is constructed and executed — operational blueprint only." />
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((p, i) => (
            <div key={p.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <ScenarioTag n={i + 1} />
                <button
                  type="button"
                  onClick={() => onOpenCompare?.(p)}
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-blue-600 underline decoration-dotted underline-offset-2 transition hover:text-blue-700"
                  title="Open Scenario Comparison"
                >
                  {p.code}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              <h4 className="text-base font-extrabold tracking-tight text-slate-900">{p.tagline || p.name}</h4>

              <dl className="mt-4 space-y-3.5">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Operational Mechanism</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-slate-600">{p.blueprint.mechanism}</dd>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Execution Implication</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-slate-600">{p.blueprint.implication}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PART 2 · Insight ════════════════════════════════ */}
      <section>
        <button
          type="button"
          onClick={() => setInsightOpen((v) => !v)}
          className="group mb-4 flex w-full items-center justify-between border-b border-slate-200 pb-3 text-left transition hover:opacity-80"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Part 2</p>
            <h3 className="mt-0.5 text-base font-extrabold tracking-tight text-slate-900">Insight</h3>
          </div>
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-indigo-500">
            {insightOpen ? 'Collapse' : 'Read full brief'}
            <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 ${insightOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-4 w-4" />
            </span>
          </span>
        </button>

        {/* Collapsed preview — the AI intro teaser so the section is never empty */}
        {brief && !insightOpen && (
          <button
            type="button"
            onClick={() => setInsightOpen(true)}
            className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/60 to-white px-6 py-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">AI Allocation Brief</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-600"><RichText text={brief.intro} /></p>
                <p className="mt-2 text-[11px] font-bold text-indigo-600">
                  {brief.sections.length} sections · patterns, financials, DC dynamics &amp; trade-offs &rarr;
                </p>
              </div>
            </div>
          </button>
        )}

        {brief && insightOpen && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-6 px-6 py-6">
              {/* Intro */}
              <p className="text-[13px] leading-relaxed text-slate-600"><RichText text={brief.intro} /></p>

              {/* Themed sections */}
              {brief.sections.map((s) => (
                <div key={s.title} className="border-t border-slate-100 pt-5">
                  <BriefSection icon={s.icon} title={s.title} bullets={s.bullets} />
                </div>
              ))}

              {/* Suggestions — tinted callout */}
              {brief.suggestions?.length > 0 && (
                <div className="rounded-xl bg-slate-50 px-5 py-4 ring-1 ring-slate-100">
                  <p className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-violet-600">
                    <Sparkles className="h-4 w-4" /> Suggestions
                  </p>
                  <ul className="space-y-2.5">
                    {brief.suggestions.map((b, k) => (
                      <li key={k} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                        <span><RichText text={b} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Closing summary — left-accent callout */}
              {brief.closing && (
                <div className="rounded-r-lg border-l-4 border-indigo-500 bg-indigo-50/50 px-5 py-4">
                  <p className="text-[13px] leading-relaxed text-slate-600"><RichText text={brief.closing} /></p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
