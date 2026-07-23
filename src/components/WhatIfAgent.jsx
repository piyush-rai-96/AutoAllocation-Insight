import { useState, useEffect } from 'react'
import {
  Sparkles,
  FlaskConical,
  ExternalLink,
  Settings2,
  Gauge,
  Copy,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ClipboardList,
  PackageCheck,
  CheckCircle2,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  Workflow,
  Lightbulb,
} from 'lucide-react'
import { whatIfAgent } from '../data/mockData'
import SectionHeader from './SectionHeader'
import { useToast } from './Toast'
import ScenarioEvaluator from './ScenarioEvaluator'

// Semantic tone for a delta direction.
const dirTone = {
  good: { text: 'text-emerald-600', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: '🟢' },
  bad: { text: 'text-rose-600', chip: 'bg-rose-50 text-rose-700 ring-rose-200', dot: '🔴' },
  warn: { text: 'text-amber-600', chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: '🟡' },
  neutral: { text: 'text-slate-500', chip: 'bg-slate-50 text-slate-600 ring-slate-200', dot: '' },
}

// Format a signed numeric delta (currency deltas get a $, plain get commas).
function fmtDelta(delta, { money = false } = {}) {
  if (delta === null || delta === undefined || delta === 0) return null
  const sign = delta > 0 ? '+' : '−'
  const abs = Math.abs(delta)
  const num = money ? `$${abs.toLocaleString()}` : abs.toLocaleString()
  return `${sign}${num}`
}

// Short display label for an entity kind (Style-Colors / Doors / Stores).
function entityLabel(kind) {
  if (!kind) return ''
  if (/store/i.test(kind)) return 'Doors'
  return kind
}

// Aggregate the scope of changed settings by entity kind → [{ kind, count }].
function summarizeScope(changedRows) {
  const totals = {}
  changedRows.forEach((r) => {
    const n = r.entities?.ids?.length
    if (!n) return
    const label = entityLabel(r.entities.kind)
    totals[label] = (totals[label] || 0) + n
  })
  return Object.entries(totals).map(([kind, count]) => ({ kind, count }))
}

// A hyperlink styled to clearly signal it's clickable and opens another screen.
function ScreenLink({ children, onClick, variant = 'plan' }) {
  const styles =
    variant === 'scenario'
      ? 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100'
      : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100'
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-sm font-bold underline decoration-dotted underline-offset-2 transition ${styles}`}
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </button>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium ring-1 ring-white/50 ${className}`}>
      {children}
    </div>
  )
}

function CardTitle({ icon: Icon, children, tint = 'blue', number, collapsible = false, collapsed = false, onToggle }) {
  const tintMap = {
    blue: 'from-indigo-400 to-sky-400',
    violet: 'from-violet-400 to-fuchsia-400',
    amber: 'from-amber-400 to-orange-400',
    slate: 'from-slate-500 to-slate-600',
  }
  const inner = (
    <>
      {number && (
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px] font-extrabold tabular-nums text-slate-500 shadow-sm">
          {number}
        </span>
      )}
      <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tintMap[tint]} text-white shadow-sm`}>
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700">{children}</h3>
      {collapsible && (
        <span className="ml-auto flex flex-shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {collapsed ? 'Show details' : 'Hide'}
          <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </span>
      )}
    </>
  )
  const base = 'flex w-full items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-sky-50/40 to-white px-4 py-3'
  if (collapsible) {
    return (
      <button type="button" onClick={onToggle} className={`${base} text-left transition hover:from-indigo-50 hover:via-sky-50/60`}>
        {inner}
      </button>
    )
  }
  return <div className={base}>{inner}</div>
}

// ── Settings delta row: exact Base → Scenario value + direct impact ──────
function SettingDelta({ row, onCopy }) {
  const tone = dirTone[row.impactDir] || dirTone.neutral
  const [expanded, setExpanded] = useState(false)
  const ent = row.entities
  const ids = ent?.ids || []
  const preview = 6
  const shown = expanded ? ids : ids.slice(0, preview)
  const hidden = ids.length - preview
  return (
    <div className={`flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 ${row.changed ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/50'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-slate-700">{row.setting}</p>
        {row.changed ? (
          <span className="inline-flex flex-shrink-0 items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-700">
            Changed
          </span>
        ) : (
          <span className="inline-flex flex-shrink-0 items-center rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
            No change
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400">Base</span>
        <span className="rounded-md bg-white px-1.5 py-0.5 font-mono font-semibold text-slate-500 ring-1 ring-slate-200">{row.base}</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-400">Scenario</span>
        <span className={`rounded-md px-1.5 py-0.5 font-mono font-bold ring-1 ${row.changed ? 'bg-indigo-100 text-indigo-700 ring-indigo-200' : 'bg-white text-slate-500 ring-slate-200'}`}>{row.value}</span>
      </div>
      <p className={`text-[11px] font-semibold leading-relaxed ${tone.text}`}>
        <span className="font-bold text-slate-400">What it changes: </span>
        {row.impact}
      </p>

      {ids.length > 0 && (
        <div className="mt-0.5 border-t border-indigo-100 pt-1.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Impacted {ent.kind} ({ids.length})
            </span>
            <button
              onClick={() => onCopy(ids, ent.kind)}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 transition hover:bg-indigo-100"
            >
              <Copy className="h-3 w-3" /> Copy all
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {shown.map((id) => (
              <span key={id} className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {id}
              </span>
            ))}
            {hidden > 0 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="rounded-md bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-200"
              >
                +{hidden} more
              </button>
            )}
            {expanded && ids.length > preview && (
              <button
                onClick={() => setExpanded(false)}
                className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-200"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Scenario overview card ───────────────────────────────────────────────
// NOTE: superseded by ScenariosNarrative (guided flow). Kept temporarily.
// eslint-disable-next-line no-unused-vars
function ScenarioCardLegacy({ scenario, recommended }) {
  const t = scenario.tradeOff
  const pj = scenario.projectedImpact
  // Financial trade-off — the two $ outcomes lead (hero), sourced from tradeOff.
  const financialTiles = [
    { label: 'Lost Sales Risk', value: t.lostSalesUsd, delta: t.lostSalesUsdDelta, pct: t.lostSalesUsdPct, dir: t.lostSalesUsdDir, money: true },
    { label: 'Excess Risk', value: t.overAllocUsd, delta: t.overAllocUsdDelta, pct: t.overAllocUsdPct, dir: t.overAllocUsdDir, money: true },
  ]
  // Supporting volume & network context (de-duplicated with the scorecard).
  const supportingTiles = [
    { label: 'Unmet Demand', value: `${t.unmetQty} units`, delta: t.unmetQtyDelta, pct: t.unmetQtyPct, dir: t.unmetQtyDir },
    { label: 'Over-Allocated', value: `${t.overAllocQty} units`, delta: t.overAllocQtyDelta, pct: t.overAllocQtyPct, dir: t.overAllocQtyDir },
    { label: pj[2].label, value: pj[2].value, dir: pj[2].dir },
    { label: pj[3].label, value: pj[3].value, dir: pj[3].dir },
  ]
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-premium ring-1 transition hover:-translate-y-0.5 hover:shadow-premium-lg ${recommended ? 'border-violet-200 ring-violet-100' : 'border-slate-200/80 ring-white/50'}`}>
      {/* Header band */}
      <div className={`flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 ${recommended ? 'bg-gradient-to-r from-violet-50/80 to-white' : 'bg-gradient-to-r from-indigo-50/60 to-white'}`}>
        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${recommended ? 'bg-gradient-to-br from-violet-400 to-fuchsia-400' : 'bg-gradient-to-br from-indigo-400 to-sky-400'}`}>
          <FlaskConical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-slate-800">{scenario.name}</p>
          <p className="font-mono text-[10px] font-semibold text-slate-400">{scenario.code}</p>
        </div>
        {!recommended && (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Fallback
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-4">
        {/* 1 · Overview — qualitative read of the plan (tiles below own the numbers) */}
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-indigo-500">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-100 text-[9px] font-extrabold text-indigo-600">1</span>
            <Sparkles className="h-3 w-3" /> Overview
          </p>
          <p className="mb-2 text-[13px] font-semibold leading-snug text-slate-800">{scenario.overview.headline}</p>

          {/* Mechanism — data-driven cause → effect chain (distinct per plan) */}
          {scenario.causalChain && (
            <div className="mb-2.5 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-2.5">
              <p className="mb-1.5 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                <Workflow className="h-3 w-3" /> How it plays out · cause → effect
              </p>
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
                {scenario.causalChain.map((step, i) => {
                  const tone = dirTone[step.tone] || dirTone.neutral
                  return (
                    <span key={i} className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${tone.chip}`}>
                        {step.text}{tone.dot ? ` ${tone.dot}` : ''}
                      </span>
                      {i < scenario.causalChain.length - 1 && (
                        <ArrowRight className="h-3 w-3 flex-shrink-0 text-slate-300" />
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <ul className="space-y-1.5">
            {scenario.overview.points.map((p, i) => (
              <li key={i} className="text-[12px] leading-relaxed text-slate-600">
                <span className="font-bold text-slate-700">{p.label}: </span>
                {p.text}
              </li>
            ))}
          </ul>

          {/* Key changes — nested under the overview brief */}
          <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
            <p className="mb-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
              <Settings2 className="h-3 w-3" /> Key Changes
            </p>
            <ul className="space-y-1">
              {scenario.keyChanges.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600">
                  <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2 · Financial trade-off — $ risk leads, volume & network support */}
        <div className="mt-auto">
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-200 text-[9px] font-extrabold text-slate-600">2</span>
            <BarChart3 className="h-3 w-3" /> Financial Trade-off
          </p>
          {/* Hero $ outcomes */}
          <div className="grid grid-cols-2 gap-2">
            {financialTiles.map((m, i) => {
              const tone = dirTone[m.dir] || dirTone.neutral
              return (
                <div key={i} className={`rounded-xl px-3 py-2 ring-1 ${tone.chip}`}>
                  <p className="text-[9px] font-bold uppercase tracking-wide opacity-70">{m.label}</p>
                  <p className="text-lg font-extrabold tabular-nums leading-tight">{m.value}</p>
                  <p className="text-[10px] font-bold opacity-90">
                    {fmtDelta(m.delta, { money: m.money })} · {m.pct} {tone.dot}
                  </p>
                </div>
              )
            })}
          </div>
          {/* Supporting volume & network context */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {supportingTiles.map((m, i) => {
              const tone = dirTone[m.dir] || dirTone.neutral
              const hasDelta = m.delta !== null && m.delta !== undefined && m.delta !== 0
              return (
                <div key={i} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{m.label}</p>
                  <p className="flex items-baseline gap-1 text-xs font-extrabold tabular-nums text-slate-700">
                    {m.value} {!hasDelta && tone.dot}
                  </p>
                  {hasDelta && (
                    <p className={`text-[10px] font-bold ${tone.text}`}>
                      {fmtDelta(m.delta, { money: m.money })} · {m.pct} {tone.dot}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Overall comparison + soft recommendation ─────────────────────────────
function PlanComparison({ data }) {
  const { intro, insights = [], recommendation } = data
  return (
    <div className="space-y-4">
      {/* Gen AI comparative insights */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 ring-1 ring-indigo-100/50">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> AI Comparative Insights
          </span>
          {intro && <span className="text-[11px] font-medium text-slate-500">{intro}</span>}
        </div>
        <ul className="space-y-1.5">
          {insights.map((ins, i) => {
            const tone = dirTone[ins.dir] || dirTone.neutral
            return (
              <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600">
                <span className="mt-1.5 flex-shrink-0 text-[10px]">{tone.dot}</span>
                <span>
                  <span className="font-bold text-slate-700">{ins.label}: </span>
                  {ins.text}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Soft recommendation */}
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-4 ring-1 ring-violet-100">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" /> Soft Recommendation
          </span>
          <span className="text-[11px] font-bold text-slate-500">{recommendation.pick}</span>
        </div>
        <p className="mb-3 text-[14px] font-bold leading-snug text-slate-800">{recommendation.headline}</p>

        {/* "Wow" quantified insight — the standout takeaway */}
        {recommendation.wow && (
          <div className="mb-3 flex items-start gap-2.5 overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-amber-50/60 to-white p-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm">
              <Lightbulb className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-slate-900">
                {recommendation.wow.stat}
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">Did you know</span>
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">{recommendation.wow.text}</p>
            </div>
          </div>
        )}

        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">If you decide to move on it</p>
        <ul className="space-y-1">
          {recommendation.points.map((p, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[12px] leading-relaxed text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2.5 border-t border-violet-100 pt-2 text-[11px] italic text-slate-400">
          This is a soft, evidence-based steer — not an auto-decision. You stay in control of the final call.
        </p>
      </div>
    </div>
  )
}

// ── Guided-narrative building blocks for the Scenarios section ───────────
// Derive the deduplicated financial + supporting trade-off tiles for a scenario.
function scenarioTiles(s) {
  const t = s.tradeOff
  const pj = s.projectedImpact
  return {
    financial: [
      { label: 'Lost Sales Risk', value: t.lostSalesUsd, delta: t.lostSalesUsdDelta, pct: t.lostSalesUsdPct, dir: t.lostSalesUsdDir, money: true },
      { label: 'Excess Risk', value: t.overAllocUsd, delta: t.overAllocUsdDelta, pct: t.overAllocUsdPct, dir: t.overAllocUsdDir, money: true },
    ],
    supporting: [
      { label: 'Unmet Demand', value: `${t.unmetQty} units`, delta: t.unmetQtyDelta, pct: t.unmetQtyPct, dir: t.unmetQtyDir },
      { label: 'Over-Allocated', value: `${t.overAllocQty} units`, delta: t.overAllocQtyDelta, pct: t.overAllocQtyPct, dir: t.overAllocQtyDir },
      { label: pj[2].label, value: pj[2].value, dir: pj[2].dir },
      { label: pj[3].label, value: pj[3].value, dir: pj[3].dir },
    ],
  }
}

// A single narrative stage: numbered header + connective line + content.
function NarrativeStage({ n, title, connector, children, last }) {
  return (
    <div className={`px-4 py-4 ${last ? '' : 'border-b border-slate-100'}`}>
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-400 text-[11px] font-extrabold text-white shadow-sm">{n}</span>
        <div className="min-w-0">
          <h4 className="text-[12px] font-bold uppercase tracking-wide text-slate-700">{title}</h4>
          {connector && <p className="text-[11px] font-medium text-slate-400">{connector}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// Compact per-column scenario tag used inside each stage.
// The Plan ID (s.code) is a clickable link that opens the Scenario Comparison screen.
function ColTag({ s, i, recId, onOpenCompare }) {
  const rec = s.id === recId
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-white shadow-sm ${rec ? 'bg-gradient-to-br from-violet-400 to-fuchsia-400' : 'bg-gradient-to-br from-indigo-400 to-sky-400'}`}>{i + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-extrabold text-slate-800">{s.tagline || s.name}</p>
        {onOpenCompare ? (
          <button
            type="button"
            onClick={() => onOpenCompare(s)}
            title="Open Scenario Comparison"
            className="inline-flex items-center gap-0.5 font-mono text-[9px] font-bold text-blue-600 underline decoration-dotted underline-offset-2 transition hover:text-blue-700"
          >
            {s.code}
            <ExternalLink className="h-2.5 w-2.5" />
          </button>
        ) : (
          <p className="font-mono text-[9px] font-semibold text-slate-400">{s.code}</p>
        )}
      </div>
      {rec ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-violet-700">
          <BadgeCheck className="h-3 w-3" /> Recommended
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">Fallback</span>
      )}
    </div>
  )
}

// Shell for a scenario column that highlights the recommended plan.
function ColShell({ rec, children }) {
  return (
    <div className={`rounded-2xl border p-3 ${rec ? 'border-violet-200 bg-violet-50/30 ring-1 ring-violet-100' : 'border-slate-200 bg-white'}`}>
      {children}
    </div>
  )
}

// The reimagined Scenarios Under Evaluation screen — a top-to-bottom story.
function ScenariosNarrative({ data, onOpenCompare }) {
  const [showDetail, setShowDetail] = useState(false)
  const scenarios = data.scenarios
  const recId = data.recommendedScenarioId
  const baseCode = data.basePlan?.code

  return (
    <div>
      {/* Context — set the stage */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-violet-50/50 via-indigo-50/20 to-white px-4 py-3.5">
        <span className="pointer-events-none absolute -inset-24 opacity-40 aurora [background-image:radial-gradient(500px_180px_at_10%_-30%,rgba(167,139,250,0.16),transparent),radial-gradient(480px_180px_at_90%_130%,rgba(125,211,252,0.12),transparent)]" />
        <p className="relative inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-violet-500">
          <Sparkles className="h-3 w-3" /> The setup
        </p>
        <p className="relative mt-1 text-[13px] leading-relaxed text-slate-600">
          We ran <span className="font-bold text-slate-800">{scenarios.length} what-if plans</span> against the current{' '}
          <span className="font-bold text-slate-800">Base Plan{baseCode ? ` · ${baseCode}` : ''}</span> — both chasing the same goal:{' '}
          <span className="font-bold text-slate-800">recover lost sales without over-committing inventory</span>. Here is how they play out, step by step.
        </p>
        <div className="relative mt-2 flex flex-wrap items-center gap-2">
          {scenarios.map((s, i) => {
            const rec = s.id === recId
            return (
              <span key={s.id} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${rec ? 'bg-violet-100 text-violet-700 ring-violet-200' : 'bg-white text-slate-500 ring-slate-200'}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded text-[9px] text-white ${rec ? 'bg-violet-500' : 'bg-indigo-400'}`}>{i + 1}</span>
                {s.tagline || s.name}
              </span>
            )
          })}
        </div>
      </div>

      {/* 1 · What each plan does */}
      <NarrativeStage n="1" title="What each plan does" connector="The concrete levers each plan pulls versus the base.">
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((s, i) => (
            <ColShell key={s.id} rec={s.id === recId}>
              <ColTag s={s} i={i} recId={recId} onOpenCompare={onOpenCompare} />
              <p className="mb-2 text-[12px] font-semibold leading-snug text-slate-700">{s.overview.headline}</p>
              <ul className="space-y-1">
                {s.keyChanges.map((c, k) => (
                  <li key={k} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600">
                    <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </ColShell>
          ))}
        </div>
      </NarrativeStage>

      {/* 2 · How it plays out */}
      <NarrativeStage n="2" title="How it plays out" connector="The cause → effect chain those levers trigger downstream.">
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((s, i) => (
            <ColShell key={s.id} rec={s.id === recId}>
              <ColTag s={s} i={i} recId={recId} onOpenCompare={onOpenCompare} />
              {s.causalChain && (
                <div className="mb-2 flex flex-wrap items-center gap-x-1 gap-y-1.5">
                  {s.causalChain.map((step, k) => {
                    const tone = dirTone[step.tone] || dirTone.neutral
                    return (
                      <span key={k} className="flex items-center gap-1">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${tone.chip}`}>
                          {step.text}{tone.dot ? ` ${tone.dot}` : ''}
                        </span>
                        {k < s.causalChain.length - 1 && <ArrowRight className="h-3 w-3 flex-shrink-0 text-slate-300" />}
                      </span>
                    )
                  })}
                </div>
              )}
              <ul className="space-y-1 border-t border-slate-100 pt-2">
                {s.overview.points.map((p, k) => (
                  <li key={k} className="text-[11px] leading-relaxed text-slate-600">
                    <span className="font-bold text-slate-700">{p.label}: </span>{p.text}
                  </li>
                ))}
              </ul>
            </ColShell>
          ))}
        </div>
      </NarrativeStage>

      {/* 3 · The trade-offs */}
      <NarrativeStage n="3" title="The trade-offs" connector="What each plan wins back in dollars — and what it costs elsewhere.">
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((s, i) => {
            const tiles = scenarioTiles(s)
            return (
              <ColShell key={s.id} rec={s.id === recId}>
                <ColTag s={s} i={i} recId={recId} onOpenCompare={onOpenCompare} />
                <div className="grid grid-cols-2 gap-2">
                  {tiles.financial.map((m, k) => {
                    const tone = dirTone[m.dir] || dirTone.neutral
                    return (
                      <div key={k} className={`rounded-xl px-3 py-2 ring-1 ${tone.chip}`}>
                        <p className="text-[9px] font-bold uppercase tracking-wide opacity-70">{m.label}</p>
                        <p className="text-lg font-extrabold tabular-nums leading-tight">{m.value}</p>
                        <p className="text-[10px] font-bold opacity-90">{fmtDelta(m.delta, { money: m.money })} · {m.pct} {tone.dot}</p>
                      </div>
                    )
                  })}
                </div>
                {showDetail && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {tiles.supporting.map((m, k) => {
                      const tone = dirTone[m.dir] || dirTone.neutral
                      const hasDelta = m.delta !== null && m.delta !== undefined && m.delta !== 0
                      return (
                        <div key={k} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{m.label}</p>
                          <p className="flex items-baseline gap-1 text-xs font-extrabold tabular-nums text-slate-700">{m.value} {!hasDelta && tone.dot}</p>
                          {hasDelta && <p className={`text-[10px] font-bold ${tone.text}`}>{fmtDelta(m.delta, { money: m.money })} · {m.pct} {tone.dot}</p>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ColShell>
            )
          })}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="text-[11px] leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-500">Excess Risk</span> = capital tied in over-allocated stock · <span className="font-semibold text-slate-500">Lost Sales Risk</span> = revenue lost to unmet demand.
          </p>
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
          >
            {showDetail ? 'Hide' : 'Show'} volume &amp; network detail
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetail ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </NarrativeStage>

      {/* 4 · The verdict */}
      <NarrativeStage n="4" title="The verdict" connector="Both plans weighed head-to-head — with a soft, evidence-based steer." last>
        <PlanComparison data={data.planComparison} />
      </NarrativeStage>
    </div>
  )
}

export default function WhatIfAgent() {
  const data = whatIfAgent
  const push = useToast()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scorecardOpen, setScorecardOpen] = useState(false)

  const linkToReview = () => push(`Would open Review Recommendations for ${data.basePlan.code}.`)
  const openCompare = (s) => push(`Would open the Scenario Comparison screen for ${s.code} · ${s.tagline || s.name}.`)
  const copyEntities = (label) => push(`Copied ${label} to clipboard.`)
  const copyIds = (ids, kind) => {
    navigator.clipboard?.writeText(ids.join(', ')).catch(() => {})
    push(`Copied ${ids.length} ${kind} to clipboard.`)
  }

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 sm:px-6">
      <SectionHeader icon={FlaskConical} title="What If Agent" subtitle="DC allocation report" />

      {/* ── Report cover band ─────────────────────────────────────────── */}
      <Card>
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-sky-50 to-white px-5 py-5 sm:px-7 sm:py-6">
          <span className="pointer-events-none absolute -inset-24 opacity-60 aurora [background-image:radial-gradient(600px_200px_at_10%_-40%,rgba(167,139,250,0.18),transparent),radial-gradient(560px_200px_at_94%_140%,rgba(125,211,252,0.16),transparent),radial-gradient(440px_180px_at_55%_-20%,rgba(110,231,183,0.12),transparent)]" />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-400 to-sky-400 text-white shadow-premium ring-1 ring-white/50">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">AI Agent Insight</p>
                <h2 className="max-w-2xl text-lg font-extrabold leading-tight tracking-tight text-slate-900 sm:text-xl">
                  {data.insightTitle}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-xs font-semibold text-slate-500">Base Plan:</span>
                  <ScreenLink onClick={linkToReview} variant="plan">
                    {data.basePlan.code} — Review Recommendations
                  </ScreenLink>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{data.reportMeta}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 1 · Scenarios under evaluation (context: what each scenario is) ── */}
      <Card>
        <CardTitle icon={FlaskConical} tint="violet" number="1">
          Scenarios Under Evaluation
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            Operational overviews, then a side-by-side comparison
          </span>
        </CardTitle>
        <ScenarioEvaluator data={data} onOpenCompare={openCompare} />
      </Card>

      {/* ── 2 · Scenario settings vs base ─────────────────────────────── */}
      <Card>
        <CardTitle
          icon={Settings2}
          tint="slate"
          number="2"
          collapsible
          collapsed={!settingsOpen}
          onToggle={() => setSettingsOpen((v) => !v)}
        >
          Settings Changed vs Base Plan
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            Exact parameter deltas &amp; what they change at input (pre-allocation)
          </span>
        </CardTitle>
        {settingsOpen ? (
          <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {data.scenarios.map((s) => (
              <div key={s.id} className="bg-white px-4 py-3.5">
                <p className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-800">
                  {s.name}
                </p>
                <div className="space-y-2">
                  {s.settingsTable.map((row, i) => (
                    <SettingDelta key={i} row={row} onCopy={copyIds} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {data.scenarios.map((s) => {
              const changed = s.settingsTable.filter((r) => r.changed)
              const scope = summarizeScope(changed)
              return (
                <div key={s.id} className="bg-white px-4 py-3">
                  <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                    {s.name}
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${changed.length ? 'bg-indigo-100 text-indigo-700' : 'border border-slate-200 bg-white text-slate-400'}`}>
                      {changed.length ? `${changed.length} changed` : 'No change'}
                    </span>
                    {scope.map((sc) => (
                      <span key={sc.kind} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        {sc.count} {sc.kind}
                      </span>
                    ))}
                  </p>
                  {changed.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {changed.map((r, i) => {
                        const n = r.entities?.ids?.length
                        return (
                          <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/60 px-2 py-1 text-[11px] font-semibold text-slate-600">
                            {r.setting.replace(/ · .*/, '')}
                            <span className="font-mono text-slate-400">{r.base}</span>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                            <span className="font-mono font-bold text-indigo-700">{r.value}</span>
                            {n ? (
                              <span className="ml-0.5 rounded bg-white px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-500 ring-1 ring-indigo-200">
                                {n} {entityLabel(r.entities.kind)}
                              </span>
                            ) : null}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] font-medium text-slate-400">No settings changed vs base — constraints held at baseline.</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* ── 3 · Execution impact scorecard (result: KPI outcomes) ─────── */}
      <Card>
        <CardTitle
          icon={ClipboardList}
          tint="blue"
          number="3"
          collapsible
          collapsed={!scorecardOpen}
          onToggle={() => setScorecardOpen((v) => !v)}
        >
          Execution Impact Scorecard
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            {scorecardOpen ? 'All metrics expanded' : 'Major KPI per bucket'}
          </span>
        </CardTitle>
        <ScorecardSummary base={data.base} scenarios={data.scenarios} pctMap={data.comparisonPct} onAct={push} expandedAll={scorecardOpen} />
      </Card>
    </main>
  )
}

// Metric metadata (label / unit / money) shared by the scorecard buckets.
const METRIC_META = {
  eligibleStores: { label: 'Eligible Stores Considered' },
  storesAllocated: { label: 'Stores Allocated' },
  stylesAllocated: { label: 'Styles Allocated' },
  totalQty: { label: 'Total Qty (All Units)', unit: 'Units' },
  totalEaches: { label: 'Total Qty (Eaches)', unit: 'Eaches' },
  totalPacks: { label: 'Total Qty (Packs)', unit: 'Packs' },
  avgFwos: { label: 'Avg FWOS', unit: 'Wks' },
  excessUsd: { label: 'Excess Risk (USD)', money: true },
  overallocQty: { label: 'Overallocated Qty', unit: 'Units' },
  lostSalesUsd: { label: 'Lost Sales (USD)', money: true },
  unmetQty: { label: 'Unmet Demand Qty', unit: 'Units' },
  overCapacity: { label: 'Over Capacity', unit: 'Stores' },
  exhaustedDc: { label: 'Exhausted DC Stock', unit: 'Styles' },
  aggMin: { label: 'Total Min Constraints (Agg Min)', unit: 'Eaches' },
  aggMax: { label: 'Total Max Constraints (Agg Max)', unit: 'Eaches' },
  allocForMin: { label: 'Allocated For Min', unit: 'Eaches' },
  allocForDemand: { label: 'Allocated For Demand', unit: 'Eaches' },
  remainingAta: { label: 'Net Available (Remaining ATA)', unit: 'Eaches' },
  netAvailPct: { label: 'Net DC Available (% of total)' },
  dcInboundConsumed: { label: 'DC Inbound (IT) Consumed', unit: 'Eaches' },
}

const BUCKET_TINT = {
  blue: 'from-indigo-400 to-sky-400',
  violet: 'from-violet-400 to-fuchsia-400',
  amber: 'from-amber-400 to-orange-400',
  slate: 'from-slate-500 to-slate-600',
}

const shortScenario = (s) => s.name.replace(/^Scenario \d+ · /, '')

// A single value + delta chip for a scenario cell.
function CellDelta({ cell, pct, money, align = 'right' }) {
  const tone = dirTone[cell.dir] || dirTone.neutral
  const hasDelta = cell.delta !== null && cell.delta !== undefined && cell.delta !== 0
  return (
    <span className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
      <span className="text-sm font-extrabold tabular-nums text-slate-800">{cell.value}</span>
      {hasDelta ? (
        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ring-1 ${tone.chip}`}>
          {pct || fmtDelta(cell.delta, { money })} {tone.dot}
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-slate-200">flat</span>
      )}
    </span>
  )
}

// DC-wise inventory breakdown — remaining stock per DC in eaches + packs, with % of that DC's available pool.
function DcWiseTable({ base, scenarios }) {
  const plans = [{ id: 'base', label: 'Base Plan', dc: base.dc || [], accent: 'text-slate-500' }]
  scenarios.forEach((s, i) => plans.push({ id: s.id, label: `Scenario ${i + 1}`, sub: shortScenario(s), dc: s.comparison.dc || [] }))
  const dcNames = (base.dc || []).map((d) => d.name)
  const fmt = (n) => n.toLocaleString()
  const cellFor = (plan, name) => (plan.dc || []).find((d) => d.name === name)
  const totals = (dc) => dc.reduce((a, d) => ({ avail: a.avail + d.avail, ea: a.ea + d.ea, pk: a.pk + d.pk }), { avail: 0, ea: 0, pk: 0 })
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2 font-semibold">Distribution Center</th>
            <th className="px-3 py-2 text-right font-semibold">Available Pool</th>
            {plans.map((p, i) => (
              <th key={p.id} className={`px-3 py-2 text-right font-semibold ${i > 0 ? 'border-l border-slate-200' : ''}`}>
                {p.sub ? <span className="block text-[9px] font-bold text-indigo-500">{p.label}</span> : null}
                {p.sub || p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {dcNames.map((name) => {
            const avail = cellFor(plans[0], name)?.avail || 0
            return (
              <tr key={name} className="hover:bg-slate-50/60">
                <td className="px-3 py-1 font-medium text-slate-600">{name}</td>
                <td className="px-3 py-1 text-right font-semibold tabular-nums text-slate-400">{fmt(avail)} ea</td>
                {plans.map((p, i) => {
                  const d = cellFor(p, name)
                  const pctAvail = d && avail ? Math.round((d.ea / avail) * 100) : null
                  const tone = pctAvail === null ? dirTone.neutral : pctAvail >= 65 ? dirTone.good : pctAvail >= 40 ? dirTone.warn : dirTone.bad
                  return (
                    <td key={p.id} className={`px-3 py-1 text-right tabular-nums ${i > 0 ? 'border-l border-slate-200' : ''}`}>
                      {d ? (
                        <span className="flex flex-col items-end gap-0.5">
                          <span className="flex items-baseline gap-1">
                            <span className="text-[13px] font-extrabold text-slate-800">{fmt(d.ea)}<span className="ml-0.5 text-[9px] font-semibold text-slate-400">ea</span></span>
                            <span className="text-[10px] font-semibold text-slate-300">/</span>
                            <span className="text-[11px] font-semibold text-slate-500">{fmt(d.pk)}<span className="ml-0.5 text-[9px] text-slate-400">pk</span></span>
                          </span>
                          <span className={`inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-bold ring-1 ${tone.chip}`}>{pctAvail}% avail {tone.dot}</span>
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {/* Net total row */}
          <tr className="border-t border-slate-200 bg-slate-50/70 font-semibold">
            <td className="px-3 py-1 text-slate-700">Net Available (all DCs)</td>
            <td className="px-3 py-1 text-right tabular-nums text-slate-400">{fmt(totals(base.dc || []).avail)} ea</td>
            {plans.map((p, i) => {
              const t = totals(p.dc || [])
              const pctAvail = t.avail ? Math.round((t.ea / t.avail) * 100) : null
              const tone = pctAvail === null ? dirTone.neutral : pctAvail >= 65 ? dirTone.good : pctAvail >= 40 ? dirTone.warn : dirTone.bad
              return (
                <td key={p.id} className={`px-3 py-1 text-right tabular-nums ${i > 0 ? 'border-l border-slate-200' : ''}`}>
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="flex items-baseline gap-1">
                      <span className="text-[13px] font-extrabold text-slate-800">{fmt(t.ea)}<span className="ml-0.5 text-[9px] font-semibold text-slate-400">ea</span></span>
                      <span className="text-[10px] font-semibold text-slate-300">/</span>
                      <span className="text-[11px] font-semibold text-slate-500">{fmt(t.pk)}<span className="ml-0.5 text-[9px] text-slate-400">pk</span></span>
                    </span>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-bold ring-1 ${tone.chip}`}>{pctAvail}% of total {tone.dot}</span>
                  </span>
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Expandable KPI bucket — headline major KPI, drill-down, take a call ───
function KpiBucket({ bucket, base, scenarios, pctMap, onAct, expandedAll }) {
  const [open, setOpen] = useState(expandedAll)
  useEffect(() => setOpen(expandedAll), [expandedAll])
  const Icon = bucket.icon
  const pMeta = METRIC_META[bucket.primary]
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header — major KPI at a glance */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-slate-50/70"
      >
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${BUCKET_TINT[bucket.tint]} text-white shadow-sm`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-shrink-0">
          <p className="text-[12px] font-bold uppercase tracking-wide text-slate-700">{bucket.title}</p>
          <p className="mt-0.5 inline-flex items-center gap-1">
            <span className="rounded bg-indigo-50 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-indigo-600 ring-1 ring-indigo-100">Major KPI</span>
            <span className="text-[10px] font-bold text-slate-600">{pMeta.label}</span>
          </p>
        </div>
        {/* primary KPI mini-comparison — all values below are this Major KPI */}
        <div className="ml-auto hidden flex-shrink-0 items-center gap-4 md:flex">
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Base Plan</p>
            <p className="text-sm font-bold tabular-nums text-slate-500">
              {base[bucket.primary].value}{pMeta.unit ? <span className="ml-0.5 text-[9px] font-semibold text-slate-400">{pMeta.unit}</span> : null}
            </p>
          </div>
          {scenarios.map((s, i) => (
            <div key={s.id} className={`min-w-0 text-right ${i > 0 ? 'border-l border-slate-200 pl-4' : ''}`}>
              <p className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">
                <span className="text-indigo-500">Scenario {i + 1}</span> · {shortScenario(s)}
              </p>
              <CellDelta cell={s.comparison[bucket.primary]} pct={pctMap?.[s.id]?.[bucket.primary]} money={pMeta.money} />
            </div>
          ))}
        </div>
        <ChevronDown className={`ml-3 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform md:ml-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Body — full bucket metrics + take-a-call actions */}
      {open && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/40 px-3.5 py-3">
          {bucket.dcWise && (
            <>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <BarChart3 className="h-3 w-3" /> DC-wise availability · eaches &amp; packs
              </p>
              <DcWiseTable base={base} scenarios={scenarios} />
              <p className="flex items-center gap-1.5 pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Inventory movement
              </p>
            </>
          )}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2 font-semibold">Metric</th>
                  <th className="px-3 py-2 text-right font-semibold">Base</th>
                  {scenarios.map((s, i) => (
                    <th key={s.id} className={`px-3 py-2 text-right font-semibold ${i > 0 ? 'border-l border-slate-200' : ''}`}>
                      <span className="block text-[9px] font-bold text-indigo-500">Scenario {i + 1}</span>
                      {shortScenario(s)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bucket.metrics.map((k) => {
                  const meta = METRIC_META[k]
                  const bc = base[k]
                  return (
                    <tr key={k} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 font-medium text-slate-600">{meta.label}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-500">
                        {bc.value}{meta.unit ? ` ${meta.unit}` : ''}
                      </td>
                      {scenarios.map((s, i) => (
                        <td key={s.id} className={`px-3 py-2 tabular-nums ${i > 0 ? 'border-l border-slate-200' : ''}`}>
                          <CellDelta cell={s.comparison[k]} pct={pctMap?.[s.id]?.[k]} money={meta.money} />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Scorecard summary (collapsed) — expandable KPI buckets ───────────────
function ScorecardSummary({ base, scenarios, pctMap, onAct, expandedAll }) {
  const buckets = [
    { title: 'Allocation Scale', icon: PackageCheck, tint: 'blue', primary: 'totalQty',
      metrics: ['eligibleStores', 'storesAllocated', 'stylesAllocated', 'totalQty', 'totalEaches', 'totalPacks', 'avgFwos'] },
    { title: 'Risk & Trade-off', icon: Gauge, tint: 'violet', primary: 'lostSalesUsd',
      metrics: ['excessUsd', 'overallocQty', 'lostSalesUsd', 'unmetQty', 'overCapacity', 'exhaustedDc'] },
    { title: 'Allocation Drivers', icon: Settings2, tint: 'amber', primary: 'allocForDemand',
      metrics: ['aggMin', 'aggMax', 'allocForMin', 'allocForDemand'] },
    { title: 'Multi-DC Logistics & Inventory Health', icon: BarChart3, tint: 'slate', primary: 'netAvailPct', dcWise: true,
      metrics: ['remainingAta', 'dcInboundConsumed'] },
  ]
  return (
    <div className="space-y-2.5 p-4">
      {buckets.map((b) => (
        <KpiBucket key={b.title} bucket={b} base={base} scenarios={scenarios} pctMap={pctMap} onAct={onAct} expandedAll={expandedAll} />
      ))}
      <p className="flex items-center gap-1.5 pt-0.5 text-[11px] italic text-slate-400">
        <ChevronDown className="h-3 w-3 -rotate-90" />
        Expand any bucket to drill into all its metrics and take a call — or use Show details above to expand every bucket at once.
      </p>
    </div>
  )
}

// ── Comparison table (Base vs scenarios) ─────────────────────────────────
function ComparisonTable({ base, scenarios, pctMap, onCopy }) {
  const rows = [
    { label: 'Eligible Stores Considered', key: 'eligibleStores' },
    { label: 'Stores Allocated', key: 'storesAllocated', copy: 'Store IDs' },
    { label: 'Styles Allocated', key: 'stylesAllocated', copy: 'Style-Colors' },
    { label: 'Total Qty (Eaches)', key: 'totalEaches', unit: 'Eaches' },
    { label: 'Total Qty (Packs)', key: 'totalPacks', unit: 'Packs' },
    { label: 'Avg FWOS', key: 'avgFwos', unit: 'Wks' },
    { group: 'Risk & Trade-off' },
    { label: 'Excess Risk (USD)', key: 'excessUsd', money: true },
    { label: 'Overallocated Qty', key: 'overallocQty', unit: 'Units' },
    { label: 'Lost Sales (USD)', key: 'lostSalesUsd', money: true },
    { label: 'Unmet Demand Qty', key: 'unmetQty', unit: 'Units' },
    { label: 'Over Capacity', key: 'overCapacity', unit: 'Stores' },
    { label: 'Exhausted DC Stock', key: 'exhaustedDc', unit: 'Styles' },
    { group: 'Allocation Drivers (Aggregated vs. Average)' },
    { label: 'Total Min Constraints (Agg Min)', key: 'aggMin', unit: 'Eaches' },
    { label: 'Total Max Constraints (Agg Max)', key: 'aggMax', unit: 'Eaches' },
    { label: 'Allocated For Min', key: 'allocForMin', unit: 'Eaches' },
    { label: 'Allocated For Demand', key: 'allocForDemand', unit: 'Eaches' },
    { group: 'Multi-DC Logistics & Inventory Health' },
    { label: 'Total Net Available (Remaining ATA)', key: 'remainingAta', unit: 'Eaches' },
    { label: 'DC Inbound (IT) Consumed', key: 'dcInboundConsumed', unit: 'Eaches' },
  ]
  const colSpan = 2 + scenarios.length
  const shortName = (s) => s.name.replace(/^Scenario \d+ · /, '')
  return (
    <div>
      <p className="flex items-center gap-1.5 px-4 pt-3 text-[11px] italic text-slate-400">
        <Copy className="h-3 w-3" />
        Click hyperlinked counts to copy entity lists (Store IDs, Style-Colors) to clipboard.
      </p>
      <div className="overflow-x-auto p-4 pt-2">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2.5 font-semibold">Key Metric</th>
              <th className="px-3 py-2.5 font-semibold">Base Plan</th>
              {scenarios.map((s) => (
                <th key={s.id} className="px-3 py-2.5 font-semibold">
                  <span className="flex items-center gap-1.5">
                    {shortName(s)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, ri) => {
              if (row.group) {
                return (
                  <tr key={`group-${ri}`} className="bg-slate-50/80">
                    <td
                      colSpan={colSpan}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {row.group}
                    </td>
                  </tr>
                )
              }
              const baseCell = base[row.key]
              return (
                <tr key={row.key} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2.5 font-medium text-slate-600">{row.label}</td>
                  <td className="px-3 py-2.5 font-semibold tabular-nums text-slate-700">
                    {row.copy ? (
                      <button
                        onClick={() => onCopy(`Base ${row.copy}`)}
                        className="font-bold text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-800"
                      >
                        {baseCell.value}
                      </button>
                    ) : (
                      <>{baseCell.value}{row.unit ? ` ${row.unit}` : ''}</>
                    )}
                  </td>
                  {scenarios.map((s) => {
                    const cell = s.comparison[row.key]
                    const tone = dirTone[cell.dir] || dirTone.neutral
                    const pct = pctMap?.[s.id]?.[row.key]
                    const hasDelta = cell.delta !== null && cell.delta !== undefined && cell.delta !== 0
                    return (
                      <td key={s.id} className="px-3 py-2.5 tabular-nums">
                        <span className="font-bold text-slate-800">
                          {row.copy ? (
                            <button
                              onClick={() => onCopy(`${shortName(s)} ${row.copy}`)}
                              className="font-bold text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-800"
                            >
                              {cell.value}
                            </button>
                          ) : (
                            <>{cell.value}{row.unit ? ` ${row.unit}` : ''}</>
                          )}
                        </span>
                        {hasDelta ? (
                          <span className={`ml-1 text-[11px] font-bold ${tone.text}`}>
                            ({fmtDelta(cell.delta, { money: row.money })}{pct ? ` / ${pct}` : ''} {tone.dot})
                          </span>
                        ) : (
                          <span className="ml-1 text-[11px] font-medium text-slate-400">(0 / 0%)</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
