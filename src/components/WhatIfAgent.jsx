import { useState } from 'react'
import {
  Sparkles,
  FlaskConical,
  ArrowUpRight,
  ExternalLink,
  Settings2,
  Boxes,
  Network,
  Warehouse,
  Truck,
  Compass,
  Gauge,
  ShieldAlert,
  DollarSign,
  SlidersHorizontal,
  Route,
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

// Small inline delta pill: "+1,234 🟢"
function Delta({ delta, dir = 'neutral', money = false }) {
  const label = fmtDelta(delta, { money })
  if (!label) return null
  const tone = dirTone[dir] || dirTone.neutral
  return (
    <span className={`ml-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ring-1 ${tone.chip}`}>
      {label} {tone.dot}
    </span>
  )
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

function CardTitle({ icon: Icon, children, tint = 'blue' }) {
  const tintMap = {
    blue: 'from-blue-500 to-sky-500',
    violet: 'from-violet-500 to-fuchsia-500',
    amber: 'from-amber-500 to-orange-500',
    slate: 'from-slate-600 to-slate-700',
  }
  return (
    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-3">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${tintMap[tint]} text-white shadow-sm`}>
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700">{children}</h3>
    </div>
  )
}

// ── Section: Scenario Settings (Cause & Effect) ──────────────────────────
function SettingRow({ label, value, effect }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <p className="text-sm text-slate-700">
        <span className="font-semibold text-slate-500">{label}: </span>
        <span className="font-semibold text-slate-800">{value}</span>
      </p>
      <p className="text-xs italic leading-relaxed text-slate-500">
        <span className="font-semibold not-italic text-slate-400">Effect: </span>
        {effect}
      </p>
    </div>
  )
}

// ── Section: Trade-off tile ──────────────────────────────────────────────
function TradeTile({ icon, label, value, delta, dir, money }) {
  const tone = dirTone[dir] || dirTone.neutral
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-white p-3.5 shadow-sm">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span>{icon}</span>
        {label}
      </p>
      <p className="mt-1 flex items-baseline gap-1 text-xl font-extrabold tabular-nums text-slate-800">
        {value}
      </p>
      {delta !== null && delta !== undefined && (
        <p className={`mt-0.5 text-xs font-bold ${tone.text}`}>
          {fmtDelta(delta, { money })} {tone.dot} vs base
        </p>
      )}
    </div>
  )
}

// ── Section: Detailed scorecard metric row ───────────────────────────────
function MetricLine({ label, cell, help }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-bold tabular-nums text-slate-800">
          {cell.value}
          <Delta delta={cell.delta} dir={cell.dir} />
        </span>
      </div>
      {help && <p className="text-[11px] italic leading-snug text-slate-400">{help}</p>}
    </div>
  )
}

function DetailedGroup({ icon: Icon, title, children }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {title}
      </p>
      <div className="rounded-xl border border-slate-200 bg-white px-3 shadow-sm">{children}</div>
    </div>
  )
}

export default function WhatIfAgent() {
  const data = whatIfAgent
  const push = useToast()
  const [activeCount, setActiveCount] = useState(2) // 1 | 2 | 3
  const activeScenarios = data.scenarios.slice(0, activeCount)
  const isMulti = activeCount > 1

  // Recommended (multi) or the single active scenario, used for the trade-off.
  const focusScenario = isMulti
    ? activeScenarios.find((s) => s.id === data.recommendedScenarioId) || activeScenarios[0]
    : activeScenarios[0]

  const linkToReview = () => push(`Would open Review Recommendations for ${data.basePlan.code}.`)
  const linkToComparison = (name) => push(`Would open Scenario Comparison for ${name}.`)
  const copyEntities = (label) => push(`Copied ${label} to clipboard.`)

  const recommended = activeScenarios.find((s) => s.id === data.recommendedScenarioId)

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 sm:px-6">
      <SectionHeader icon={FlaskConical} title="What If Agent" subtitle="Allocation scenario simulation" />

      {/* Scenario selector */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Active scenarios</span>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setActiveCount(n)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-bold transition ${
                  activeCount === n
                    ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {activeCount === 1 ? 'Detailed view' : 'Comparison table view'} · Base {data.basePlan.code} vs{' '}
            {activeScenarios.map((s) => s.name.split(' · ')[0]).join(', ')}
          </span>
        </div>
      </Card>

      {/* Header block */}
      <Card>
        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-blue-50 via-sky-50 to-white px-5 py-4">
          <span className="pointer-events-none absolute -inset-24 opacity-60 aurora [background-image:radial-gradient(600px_180px_at_12%_-40%,rgba(59,130,246,0.16),transparent),radial-gradient(520px_180px_at_92%_140%,rgba(14,165,233,0.14),transparent)]" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-sm ring-1 ring-white/60">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">AI Agent Insight</p>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">{data.insightTitle}</h2>
            </div>
          </div>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-slate-500">Base Plan:</span>
            <ScreenLink onClick={linkToReview} variant="plan">
              {data.basePlan.code} — Review Recommendations
            </ScreenLink>
          </div>

          {/* Recommended scenario — only when comparing 2–3 scenarios */}
          {isMulti && recommended && (
            <div className="rounded-xl border border-violet-200/70 bg-gradient-to-r from-violet-50/80 to-white p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                  <Sparkles className="h-3 w-3" /> Recommended Scenario
                </span>
                <ScreenLink onClick={() => linkToComparison(recommended.name)} variant="scenario">
                  {recommended.name}
                </ScreenLink>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{recommended.overview}</p>
            </div>
          )}

          <p className="text-sm leading-relaxed text-slate-600">{data.aiOverview}</p>
        </div>
      </Card>

      {/* Scenario Settings (Cause & Effect) */}
      <Card>
        <CardTitle icon={Settings2} tint="slate">
          Scenario Settings · Cause &amp; Effect
        </CardTitle>
        <div className={`grid gap-px bg-slate-100 ${activeCount === 1 ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {activeScenarios.map((s) => (
            <div key={s.id} className="bg-white px-4 py-3">
              <p className="mb-1 text-sm font-bold text-slate-800">{s.name}</p>
              <div className="divide-y divide-slate-100">
                <SettingRow label="Modify Scenario Parameters" value={s.settings.parameters} effect={s.settings.parametersEffect} />
                <SettingRow label="Manipulate Product Scope" value={s.settings.productScope} effect={s.settings.productScopeEffect} />
                <SettingRow label="Manipulate Network Breadth" value={s.settings.networkBreadth} effect={s.settings.networkBreadthEffect} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Allocation Trade-off */}
      <Card>
        <CardTitle icon={Gauge} tint="blue">
          Allocation Trade-off
          <span className="ml-2 normal-case text-[11px] font-medium text-slate-400">
            {isMulti ? `${focusScenario.name} vs Base` : `${focusScenario.name} vs Base`}
          </span>
        </CardTitle>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <TradeTile
            icon="📉"
            label="Over-Allocation (Excess Stock Risk)"
            value={focusScenario.tradeOff.overAllocUsd}
            delta={focusScenario.tradeOff.overAllocUsdDelta}
            dir={focusScenario.tradeOff.overAllocUsdDir}
            money
          />
          <TradeTile
            icon="📦"
            label="Overallocated Qty"
            value={`${focusScenario.tradeOff.overAllocQty} Units`}
            delta={focusScenario.tradeOff.overAllocQtyDelta}
            dir={focusScenario.tradeOff.overAllocQtyDir}
          />
          <TradeTile
            icon="📈"
            label="Lost Sales Risk (Under-Allocation)"
            value={focusScenario.tradeOff.lostSalesUsd}
            delta={focusScenario.tradeOff.lostSalesUsdDelta}
            dir={focusScenario.tradeOff.lostSalesUsdDir}
            money
          />
          <TradeTile
            icon="🛒"
            label="Unmet Demand Qty"
            value={`${focusScenario.tradeOff.unmetQty} Units`}
            delta={focusScenario.tradeOff.unmetQtyDelta}
            dir={focusScenario.tradeOff.unmetQtyDir}
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

      {/* Execution Impact Scorecard */}
      <Card>
        <CardTitle icon={Boxes} tint="blue">
          Execution Impact Scorecard
        </CardTitle>
        {activeCount === 1 ? (
          <DetailedScorecard scenario={focusScenario} />
        ) : (
          <ComparisonTable base={data.base} scenarios={activeScenarios} onCopy={copyEntities} />
        )}
      </Card>

      {/* AI Recommendation widgets */}
      <div>
        <SectionHeader icon={Compass} title="AI Recommendation" subtitle="Way-forward" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.recommendation.map((w) => (
            <RecommendationWidget key={w.id} widget={w} />
          ))}
        </div>
      </div>
    </main>
  )
}

// ── Detailed view (single scenario) ──────────────────────────────────────
function DetailedScorecard({ scenario }) {
  const sc = scenario.scorecard
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-3">
      <DetailedGroup icon={Network} title="Network & Volume">
        <MetricLine label="Total Allocated Qty (Eaches)" cell={sc.totalEaches} />
        <MetricLine label="Total Allocated Qty (Packs)" cell={sc.totalPacks} />
        <MetricLine label="Eligible Stores Considered" cell={sc.eligibleStores} />
        <MetricLine label="Stores Allocated" cell={sc.storesAllocated} />
        <MetricLine label="Style-Colors Allocated" cell={sc.stylesAllocated} />
        <MetricLine label="Over Capacity (Gridlock Risk)" cell={sc.overCapacity} />
        <MetricLine label="Avg FWOS" cell={sc.avgFwos} />
      </DetailedGroup>

      <DetailedGroup icon={SlidersHorizontal} title="Allocation Drivers">
        <MetricLine
          label="Total Min Constraints (Agg Min)"
          cell={sc.aggMin}
          help="Ensures the absolute unit floor required to satisfy presentation safety stock is met."
        />
        <MetricLine
          label="Total Max Constraints (Agg Max)"
          cell={sc.aggMax}
          help="Establishes a hard ceiling on inventory depth, directly preventing backroom gridlock."
        />
        <MetricLine label="Allocated For Min" cell={sc.allocForMin} />
        <MetricLine label="Allocated For Demand" cell={sc.allocForDemand} />
      </DetailedGroup>

      <DetailedGroup icon={scenario.supplyType === 'po' ? Truck : Warehouse} title={scenario.supplyType === 'po' ? 'PO Logistics & Inventory Health' : 'Multi-DC Logistics & Inventory Health'}>
        <MetricLine label="Total Net Available (Remaining ATA)" cell={sc.netAvailable} />
        {scenario.supplyType === 'po'
          ? scenario.supply.map((p, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Truck className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono text-xs font-semibold text-slate-700">{p.po}</span>
                  <span className="text-xs text-slate-400">(ETA {p.eta})</span>
                </span>
                <span className={`text-sm font-bold tabular-nums ${dirTone[p.dir]?.text || 'text-slate-700'}`}>
                  {p.value} {dirTone[p.dir]?.dot}
                </span>
              </div>
            ))
          : scenario.supply.map((d, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Warehouse className="h-3.5 w-3.5 text-slate-400" />
                  {d.name}
                  {d.note && <span className="text-[11px] italic text-slate-400">· {d.note}</span>}
                </span>
                <span className={`text-sm font-bold tabular-nums ${dirTone[d.dir]?.text || 'text-slate-700'}`}>
                  {d.value} {d.delta ? dirTone[d.dir]?.dot : ''}
                </span>
              </div>
            ))}
        <MetricLine label="Exhausted DC Stock (Style-Colors)" cell={sc.exhaustedDc} />
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-slate-600">DC Inbound (IT) Consumed</span>
          <span className="font-bold tabular-nums text-slate-800">{sc.itConsumed.value}</span>
        </div>
        {scenario.supplyType === 'po' && (
          <p className="pb-2 text-[11px] italic text-slate-400">
            Allocated against arriving POs {scenario.supply.map((p) => p.po).join(', ')}.
          </p>
        )}
      </DetailedGroup>
    </div>
  )
}

// ── Comparison table (2–3 scenarios) ─────────────────────────────────────
function ComparisonTable({ base, scenarios, onCopy }) {
  // rows: [label, key, {copyable?}]
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
    { label: 'Exhausted DC Stock', key: 'exhaustedDc', unit: 'Styles' },
  ]
  return (
    <div>
      <p className="px-4 pt-3 text-[11px] italic text-slate-400">
        Click hyperlinked counts to copy entity lists (Store IDs, Style-Colors) to clipboard.
      </p>
      <div className="overflow-x-auto p-4 pt-2">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2.5 font-semibold">Key Metric</th>
              <th className="px-3 py-2.5 font-semibold">Base Plan</th>
              {scenarios.map((s) => (
                <th key={s.id} className="px-3 py-2.5 font-semibold">
                  {s.name.split(' · ')[0]}
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
                        className="font-bold text-blue-600 underline decoration-dotted underline-offset-2 hover:text-blue-800"
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
                    return (
                      <td key={s.id} className="px-3 py-2.5 tabular-nums">
                        <span className="font-bold text-slate-800">
                          {row.copy ? (
                            <button
                              onClick={() => onCopy(`${s.name.split(' · ')[0]} ${row.copy}`)}
                              className="font-bold text-blue-600 underline decoration-dotted underline-offset-2 hover:text-blue-800"
                            >
                              {cell.value}
                            </button>
                          ) : (
                            <>{cell.value}{row.unit ? ` ${row.unit}` : ''}</>
                          )}
                        </span>
                        {cell.delta ? (
                          <span className={`ml-1 text-[11px] font-bold ${tone.text}`}>
                            ({fmtDelta(cell.delta, { money: row.money })} {tone.dot})
                          </span>
                        ) : null}
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

// ── AI Recommendation widget ─────────────────────────────────────────────
const widgetMeta = {
  wayforward: { icon: Route, tint: 'from-blue-500 to-sky-500', ring: 'ring-blue-100' },
  confidence: { icon: Gauge, tint: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-100' },
  risk: { icon: ShieldAlert, tint: 'from-rose-500 to-red-500', ring: 'ring-rose-100' },
  upside: { icon: DollarSign, tint: 'from-emerald-500 to-green-600', ring: 'ring-emerald-100' },
  constraints: { icon: SlidersHorizontal, tint: 'from-amber-500 to-orange-500', ring: 'ring-amber-100' },
  nextbest: { icon: ArrowUpRight, tint: 'from-violet-500 to-fuchsia-500', ring: 'ring-violet-100' },
}

function RecommendationWidget({ widget }) {
  const meta = widgetMeta[widget.kind] || widgetMeta.wayforward
  const Icon = meta.icon
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-premium ring-1 ${meta.ring} transition hover:-translate-y-0.5 hover:shadow-premium-lg`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${meta.tint} text-white shadow-sm`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{widget.title}</p>
        {widget.score && (
          <span className="ml-auto text-lg font-extrabold tabular-nums text-slate-800">{widget.score}</span>
        )}
      </div>
      {widget.headline && <p className="text-sm font-bold text-slate-800">{widget.headline}</p>}
      <p className="text-xs leading-relaxed text-slate-500">{widget.body}</p>
    </div>
  )
}
