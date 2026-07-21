import {
  Sparkles,
  FlaskConical,
  ExternalLink,
  Settings2,
  Gauge,
  ShieldAlert,
  DollarSign,
  Compass,
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

// ── Cause & Effect row (parameter → effect) ──────────────────────────────
function CauseEffect({ label, value, effect }) {
  return (
    <div className="flex flex-col gap-1 py-2.5">
      <p className="text-[13px] leading-relaxed text-slate-700">
        <span className="font-bold text-slate-500">{label}: </span>
        <span className="font-semibold text-slate-800">{value}</span>
      </p>
      <p className="flex items-start gap-1.5 rounded-lg bg-slate-50/80 px-2.5 py-1.5 text-xs leading-relaxed text-slate-500">
        <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
        <span>
          <span className="font-bold not-italic text-slate-400">Effect: </span>
          {effect}
        </span>
      </p>
    </div>
  )
}

// ── Executive summary headline tile ──────────────────────────────────────
function StatTile({ label, value, sub, dir = 'good' }) {
  const tone = dirTone[dir] || dirTone.neutral
  const Trend = dir === 'bad' ? TrendingUp : TrendingDown
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-premium ring-1 ring-white/50">
      <span className={`absolute left-0 top-0 h-full w-1 ${dir === 'good' ? 'bg-gradient-to-b from-emerald-300 to-teal-300' : dir === 'bad' ? 'bg-gradient-to-b from-rose-300 to-pink-300' : 'bg-gradient-to-b from-indigo-300 to-sky-300'}`} />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
      <p className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold ${tone.text}`}>
        <Trend className="h-3 w-3" />
        {sub}
      </p>
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
function ScenarioCard({ scenario, recommended }) {
  return (
    <div className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border bg-white p-4 shadow-premium ring-1 transition hover:-translate-y-0.5 hover:shadow-premium-lg ${recommended ? 'border-violet-200 ring-violet-100' : 'border-slate-200/80 ring-white/50'}`}>
      {recommended && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
          <BadgeCheck className="h-3 w-3" /> Recommended
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm ${recommended ? 'bg-gradient-to-br from-violet-400 to-fuchsia-400' : 'bg-gradient-to-br from-indigo-400 to-sky-400'}`}>
          <FlaskConical className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-800">{scenario.name}</p>
          <p className="font-mono text-[10px] font-semibold text-slate-400">{scenario.code}</p>
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Plan specific to Allocation Scenario</p>
      <p className="text-[13px] leading-relaxed text-slate-600">{scenario.overview}</p>
    </div>
  )
}

// ── Agent Action Playbook step ───────────────────────────────────────────
function ActionStep({ index, action, onCopy }) {
  const tone = dirTone[action.impactDir] || dirTone.neutral
  return (
    <div className="group relative flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-premium ring-1 ring-white/50 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-premium-lg">
      <div className="flex flex-shrink-0 flex-col items-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-sky-400 text-sm font-extrabold text-white shadow-sm">
          {index}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-slate-800">{action.title}</p>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">
            <PackageCheck className="h-3 w-3" /> {action.po}
          </span>
          {action.impact && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${tone.chip}`}>
              {action.impact}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{action.body}</p>
      </div>
      <button
        onClick={() => onCopy(action)}
        title="Copy this action"
        aria-label={`Copy action: ${action.title}`}
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── AI verdict tile (confidence / upside / risk) ─────────────────────────
const verdictMeta = {
  confidence: { icon: Gauge, tint: 'from-emerald-400 to-teal-400', ring: 'ring-emerald-100' },
  upside: { icon: DollarSign, tint: 'from-emerald-400 to-green-500', ring: 'ring-emerald-100' },
  risk: { icon: ShieldAlert, tint: 'from-amber-400 to-orange-400', ring: 'ring-amber-100' },
}

function VerdictTile({ tile }) {
  const meta = verdictMeta[tile.kind] || verdictMeta.confidence
  const Icon = meta.icon
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-premium ring-1 ${meta.ring} transition hover:-translate-y-0.5 hover:shadow-premium-lg`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${meta.tint} text-white shadow-sm`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{tile.title}</p>
        {tile.score && (
          <span className="ml-auto text-lg font-extrabold tabular-nums text-slate-800">{tile.score}</span>
        )}
      </div>
      {tile.headline && <p className="text-sm font-bold text-slate-800">{tile.headline}</p>}
      <p className="text-xs leading-relaxed text-slate-500">{tile.body}</p>
    </div>
  )
}

export default function WhatIfAgent() {
  const data = whatIfAgent
  const push = useToast()

  const recommended = data.scenarios.find((s) => s.id === data.recommendedScenarioId) || data.scenarios[0]
  const focusScenario = recommended

  const linkToReview = () => push(`Would open Review Recommendations for ${data.basePlan.code}.`)
  const copyEntities = (label) => push(`Copied ${label} to clipboard.`)
  const copyAction = (action) => {
    const text = `${action.title} [${action.po}] — ${action.body}`
    navigator.clipboard?.writeText(text).catch(() => {})
    push(`Copied action: ${action.title}`)
  }

  const to = focusScenario.tradeOff

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 sm:px-6">
      <SectionHeader icon={FlaskConical} title="What If Agent" subtitle="Purchase-order allocation report" />

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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5" /> Recommended: {recommended.tagline}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{data.reportMeta}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 1 · Executive summary ─────────────────────────────────────── */}
      <Card>
        <CardTitle icon={Compass} tint="blue" number="1">
          Executive Summary
        </CardTitle>
        <div className="space-y-4 p-4">
          <p className="text-sm leading-relaxed text-slate-600">{data.aiOverview}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.summaryTiles.map((t) => (
              <StatTile key={t.id} label={t.label} value={t.value} sub={t.sub} dir={t.dir} />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {data.verdict.map((t) => (
              <VerdictTile key={t.id} tile={t} />
            ))}
          </div>
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

      {/* ── 3 · Scenario settings (cause & effect) ────────────────────── */}
      <Card>
        <CardTitle icon={Settings2} tint="slate" number="3">
          Scenario Settings · Cause &amp; Effect
        </CardTitle>
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
          {data.scenarios.map((s) => (
            <div key={s.id} className="bg-white px-4 py-3.5">
              <p className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                {s.name}
                {s.id === data.recommendedScenarioId && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                    <BadgeCheck className="h-3 w-3" /> Rec.
                  </span>
                )}
              </p>
              <div className="divide-y divide-slate-100">
                <CauseEffect label="Modify Scenario Parameters" value={s.settings.parameters} effect={s.settings.parametersEffect} />
                <CauseEffect label="Manipulate Product Scope" value={s.settings.productScope} effect={s.settings.productScopeEffect} />
                <CauseEffect label="Manipulate Network Breadth" value={s.settings.networkBreadth} effect={s.settings.networkBreadthEffect} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 4 · Allocation trade-off ──────────────────────────────────── */}
      <Card>
        <CardTitle icon={Gauge} tint="blue" number="4">
          Allocation Trade-off
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            {recommended.tagline} (Recommended) vs Base Plan
          </span>
        </CardTitle>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <TradeTile
            icon={TrendingDown}
            label="Over-Allocation (Excess Risk)"
            value={to.overAllocUsd}
            delta={to.overAllocUsdDelta}
            pct={to.overAllocUsdPct}
            dir={to.overAllocUsdDir}
            money
          />
          <TradeTile
            icon={PackageCheck}
            label="Overallocated Qty"
            value={`${to.overAllocQty} Units`}
            delta={to.overAllocQtyDelta}
            pct={to.overAllocQtyPct}
            dir={to.overAllocQtyDir}
          />
          <TradeTile
            icon={TrendingUp}
            label="Lost Sales Risk (Under-Allocation)"
            value={to.lostSalesUsd}
            delta={to.lostSalesUsdDelta}
            pct={to.lostSalesUsdPct}
            dir={to.lostSalesUsdDir}
            money
          />
          <TradeTile
            icon={BarChart3}
            label="Unmet Demand Qty"
            value={`${to.unmetQty} Units`}
            delta={to.unmetQtyDelta}
            pct={to.unmetQtyPct}
            dir={to.unmetQtyDir}
          />
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

      {/* ── 6 · Agent action playbook ─────────────────────────────────── */}
      <div>
        <SectionHeader icon={CheckCircle2} title="Agent Action Playbook" subtitle="Recommended PO-level way-forward" />
        <div className="grid gap-3">
          {data.actions.map((a, i) => (
            <ActionStep key={a.id} index={i + 1} action={a} onCopy={copyAction} />
          ))}
        </div>
      </div>
    </main>
  )
}

// ── Comparison table (Base vs scenarios) ─────────────────────────────────
function ComparisonTable({ base, scenarios, pctMap, onCopy }) {
  const rows = [
    { label: 'Stores Allocated', key: 'storesAllocated', copy: 'Store IDs' },
    { label: 'Styles Allocated', key: 'stylesAllocated', copy: 'Style-Colors' },
    { label: 'Total Qty (Eaches)', key: 'totalEaches' },
    { label: 'Total Qty (Packs)', key: 'totalPacks' },
    { label: 'Excess Risk (USD)', key: 'excessUsd', money: true },
    { label: 'Overallocated Qty', key: 'overallocQty', unit: 'Units' },
    { label: 'Lost Sales (USD)', key: 'lostSalesUsd', money: true },
    { label: 'Unmet Demand Qty', key: 'unmetQty', unit: 'Units' },
    { label: 'Over Capacity', key: 'overCapacity', unit: 'Stores' },
    { label: 'Exhausted PO Stock', key: 'exhaustedPo', unit: 'Styles' },
  ]
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
                    {s.id === 'sc-1' && <BadgeCheck className="h-3.5 w-3.5 text-violet-500" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
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
