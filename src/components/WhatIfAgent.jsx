import { useState } from 'react'
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
} from 'lucide-react'
import { whatIfAgent } from '../data/mockData'
import SectionHeader from './SectionHeader'
import { useToast } from './Toast'

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

function CardTitle({ icon: Icon, children, tint = 'blue', number }) {
  const tintMap = {
    blue: 'from-indigo-400 to-sky-400',
    violet: 'from-violet-400 to-fuchsia-400',
    amber: 'from-amber-400 to-orange-400',
    slate: 'from-slate-500 to-slate-600',
  }
  return (
    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-sky-50/40 to-white px-4 py-3">
      {number && (
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px] font-extrabold tabular-nums text-slate-500 shadow-sm">
          {number}
        </span>
      )}
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${tintMap[tint]} text-white shadow-sm`}>
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700">{children}</h3>
    </div>
  )
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

// ── Trade-off tile: value + signed delta + percent ───────────────────────
function TradeTile({ icon: Icon, label, value, delta, pct, dir, money }) {
  const tone = dirTone[dir] || dirTone.neutral
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${tone.chip} ring-1`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
      {(delta !== null && delta !== undefined) && (
        <p className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${tone.chip}`}>
          {fmtDelta(delta, { money })}
          {pct ? ` · ${pct}` : ''} {tone.dot}
        </p>
      )}
    </div>
  )
}

// ── Scenario overview card ───────────────────────────────────────────────
// A thoughtful, structured plan brief — written as if an LLM synthesised the
// calculated plan metrics into an overview, key changes, and projected impact.
function ScenarioCard({ scenario, recommended }) {
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
        {/* Impact — structured synthesis of the plan metrics */}
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-indigo-500">
            <Sparkles className="h-3 w-3" /> Impact
          </p>
          <p className="mb-2 text-[13px] font-semibold leading-snug text-slate-800">{scenario.overview.headline}</p>
          <ul className="space-y-1.5">
            {scenario.overview.points.map((p, i) => (
              <li key={i} className="text-[12px] leading-relaxed text-slate-600">
                <span className="font-bold text-slate-700">{p.label}: </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Key changes */}
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            <Settings2 className="h-3 w-3" /> Key Changes
          </p>
          <ul className="space-y-1">
            {scenario.keyChanges.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-600">
                <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Projected impact */}
        <div className="mt-auto">
          <p className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            <BarChart3 className="h-3 w-3" /> Impact
          </p>
          <div className="grid grid-cols-2 gap-2">
            {scenario.projectedImpact.map((m, i) => {
              const tone = dirTone[m.dir] || dirTone.neutral
              return (
                <div key={i} className={`rounded-xl px-2.5 py-1.5 ring-1 ${tone.chip}`}>
                  <p className="text-[9px] font-bold uppercase tracking-wide opacity-70">{m.label}</p>
                  <p className="text-xs font-extrabold tabular-nums">{m.value} {tone.dot}</p>
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
  const { intro, insights = [], columns, recommendation } = data
  return (
    <div className="p-4">
      {/* Plans analyzed */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-3.5 ring-1 ring-white/50"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-800">{col.name}</p>
                <p className="font-mono text-[10px] font-semibold text-slate-400">{col.code}</p>
              </div>
            </div>
            <p className="mt-auto text-[12px] leading-snug text-slate-500">{col.verdict}</p>
          </div>
        ))}
      </div>

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
      <div className="mt-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-4 ring-1 ring-violet-100">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" /> Recommendation
          </span>
          <span className="text-[11px] font-bold text-slate-500">{recommendation.pick}</span>
        </div>
        <p className="mb-2 text-[14px] font-bold leading-snug text-slate-800">{recommendation.headline}</p>
        <ul className="space-y-1">
          {recommendation.points.map((p, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[12px] leading-relaxed text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function WhatIfAgent() {
  const data = whatIfAgent
  const push = useToast()

  const linkToReview = () => push(`Would open Review Recommendations for ${data.basePlan.code}.`)
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

      {/* ── 1 · Scenario settings vs base ─────────────────────────────── */}
      <Card>
        <CardTitle icon={Settings2} tint="slate" number="1">
          Settings Changed vs Base Plan
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            Exact parameter deltas &amp; what they change at input (pre-allocation)
          </span>
        </CardTitle>
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
      </Card>

      {/* ── 2 · Scenarios under evaluation ────────────────────────────── */}
      <Card>
        <CardTitle icon={FlaskConical} tint="violet" number="2">
          Scenarios Under Evaluation
        </CardTitle>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          {data.scenarios.map((s) => (
            <ScenarioCard key={s.id} scenario={s} recommended={s.id === data.recommendedScenarioId} />
          ))}
        </div>
      </Card>

      {/* ── 3 · Overall comparison + soft recommendation ──────────────── */}
      <Card>
        <CardTitle icon={CheckCircle2} tint="violet" number="3">
          Overall Comparison &amp; Recommendation
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            Base vs Plan 1 vs Plan 2 — at a glance
          </span>
        </CardTitle>
        <PlanComparison data={data.planComparison} />
      </Card>

      {/* ── 4 · Allocation trade-off ──────────────────────────────────── */}
      <Card>
        <CardTitle icon={Gauge} tint="blue" number="4">
          Allocation Trade-off
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            Both scenarios vs Base Plan
          </span>
        </CardTitle>
        <div className="divide-y divide-slate-100">
          {data.scenarios.map((s) => {
            const t = s.tradeOff
            const isRec = s.id === data.recommendedScenarioId
            return (
              <div key={s.id} className="p-4">
                <p className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-800">
                  {s.name}
                  {!isRec && (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Fallback
                    </span>
                  )}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <TradeTile
                    icon={TrendingDown}
                    label="Over-Allocation (Excess Risk)"
                    value={t.overAllocUsd}
                    delta={t.overAllocUsdDelta}
                    pct={t.overAllocUsdPct}
                    dir={t.overAllocUsdDir}
                    money
                  />
                  <TradeTile
                    icon={PackageCheck}
                    label="Overallocated Qty"
                    value={`${t.overAllocQty} Units`}
                    delta={t.overAllocQtyDelta}
                    pct={t.overAllocQtyPct}
                    dir={t.overAllocQtyDir}
                  />
                  <TradeTile
                    icon={TrendingUp}
                    label="Lost Sales Risk (Under-Allocation)"
                    value={t.lostSalesUsd}
                    delta={t.lostSalesUsdDelta}
                    pct={t.lostSalesUsdPct}
                    dir={t.lostSalesUsdDir}
                    money
                  />
                  <TradeTile
                    icon={BarChart3}
                    label="Unmet Demand Qty"
                    value={`${t.unmetQty} Units`}
                    delta={t.unmetQtyDelta}
                    pct={t.unmetQtyPct}
                    dir={t.unmetQtyDir}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] leading-relaxed text-slate-400">
          <p>
            <span className="font-semibold text-slate-500">Overallocation Value:</span> cost tied up in excess inventory — units allocated beyond requirement × product price.
          </p>
          <p>
            <span className="font-semibold text-slate-500">Lost Sales Value:</span> uncaptured revenue from unmet demand — shortfall in allocated units vs requirement × product price.
          </p>
        </div>
      </Card>

      {/* ── 5 · Execution impact scorecard ────────────────────────────── */}
      <Card>
        <CardTitle icon={ClipboardList} tint="blue" number="5">
          Execution Impact Scorecard
        </CardTitle>
        <ComparisonTable base={data.base} scenarios={data.scenarios} pctMap={data.comparisonPct} onCopy={copyEntities} />
      </Card>
    </main>
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
