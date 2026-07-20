import { forwardRef, useState } from 'react'
import {
  ChevronRight,
  Store,
  Copy,
  FolderTree,
  Puzzle,
  Lock,
  AlertOctagon,
  Ruler,
  ArrowUpNarrowWide,
  Download,
  Timer,
  PackageX,
  DollarSign,
  Warehouse,
  Network,
  ArrowRight,
  TriangleAlert,
} from 'lucide-react'
import { insights, getPlanMeta, buildInsightExport } from '../data/mockData'
import Tooltip from './Tooltip'
import { useToast } from './Toast'
import SectionHeader from './SectionHeader'

const planStatusMap = {
  Urgent: { dot: 'bg-rose-500', bar: 'bg-rose-500' },
  Constrained: { dot: 'bg-amber-500', bar: 'bg-amber-500' },
  Safe: { dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
}

// Eye-catching flag for plans whose forward weeks of supply drop below 1 week —
// the leading edge of stockout risk. Only renders when fwos < 1.
function FwosFlag({ fwos, stores, compact = false }) {
  if (typeof fwos !== 'number' || fwos >= 1) return null
  const label = `${fwos.toFixed(1)}w`
  return (
    <Tooltip
      content={`Forward Weeks of Supply is ${label} — below the 1-week safety line${
        stores ? `. ${stores} store${stores === 1 ? '' : 's'} at imminent stockout.` : '.'
      }`}
      width="w-64"
    >
      <span className="group/fwos relative inline-flex cursor-help items-center gap-1 overflow-hidden rounded-full border border-rose-300/70 bg-gradient-to-r from-rose-500 to-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_0_12px_1px_rgba(244,63,94,0.45)]">
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/fwos:animate-sheen" />
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        <Timer className="relative h-3 w-3" />
        <span className="relative tabular-nums">FWOS {label}</span>
        {!compact && stores ? (
          <span className="relative rounded-full bg-white/20 px-1 tabular-nums">{stores}</span>
        ) : null}
      </span>
    </Tooltip>
  )
}

// A single polished "flag" chip used across every plan metric for a consistent, premium look.
function MetricChip({ icon: Icon, label, value, title, tone = 'slate' }) {
  const toneMap = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  }
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow ${toneMap[tone]}`}
    >
      {Icon && <Icon className="h-3 w-3 opacity-70" />}
      {label && <span className="font-bold uppercase tracking-wide opacity-60">{label}</span>}
      <span className="tabular-nums">{value}</span>
    </span>
  )
}

function PlanMetrics({ meta }) {
  if (!meta) return null
  const s = planStatusMap[meta.status] || planStatusMap.Constrained
  const statusTone =
    meta.status === 'Urgent' ? 'rose' : meta.status === 'Safe' ? 'emerald' : 'amber'
  const rateTone = meta.rate >= 90 ? 'emerald' : meta.rate >= 60 ? 'amber' : 'rose'
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {/* Allocation Rate — chip with inline mini progress bar */}
      <MetricChip
        tone={rateTone}
        label="Rate"
        title="Allocation Rate"
        value={
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-10 overflow-hidden rounded-full bg-black/10">
              <span className={`block h-full rounded-full ${s.bar}`} style={{ width: `${meta.rate}%` }} />
            </span>
            <span className="font-bold">{meta.rate.toFixed(1)}%</span>
          </span>
        }
      />
      <MetricChip icon={PackageX} label="Unmet" value={meta.unmet} title="Unmet Volume" tone="slate" />
      <MetricChip icon={DollarSign} label="Risk" value={meta.revenue} title="Revenue at Risk" tone="violet" />
      <FwosFlag fwos={meta.fwos} stores={meta.fwosStores} />
      <MetricChip
        icon={() => <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
        value={meta.status}
        title="Status"
        tone={statusTone}
      />
    </div>
  )
}

// Directory display caps — keep the Handbook cozy; the full set is one export away.
const MAX_PLANS = 10
const MAX_STYLES = 5
const MAX_STORES = 5

// Parse a currency/number-ish string to a sortable number (e.g. "$221.00" -> 221).
const toNum = (s) => (s ? parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0 : 0)

// Rank plans worst-first so the visible "top N" are the highest-impact ones.
function rankPlans(plans) {
  return [...plans].sort((a, b) => {
    const ma = getPlanMeta(a.id)
    const mb = getPlanMeta(b.id)
    return toNum(mb?.revenue) - toNum(ma?.revenue) || toNum(mb?.unmet) - toNum(ma?.unmet)
  })
}

// Footer shown only when a list is truncated: "Showing top X of N — Export full list".
function TruncationFooter({ shown, total, noun, bucketId, sortBasis, indent = '' }) {
  const push = useToast()
  if (total <= shown) return null
  const exportFull = (e) => {
    e.stopPropagation()
    const lines = buildInsightExport(bucketId)
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {})
    push(`Exported full list (${lines.length - 1} rows) to clipboard as CSV.`)
  }
  return (
    <div className={`mt-1 flex flex-wrap items-center gap-2 py-1 ${indent}`}>
      <span className="text-[11px] font-medium text-slate-400">
        Showing top {shown} of {total} {noun}
        {sortBasis ? ` by ${sortBasis}` : ''}
      </span>
      <button
        onClick={exportFull}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow"
      >
        <Download className="h-3 w-3" />
        Export full list
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Bucket registry — this is the ONE place to extend when adding new insight
// dimensions. A new bucket just references an existing `tone` + `iconName`
// from the data; no per-id maps or component edits are required. Plenty of
// colors/icons are pre-registered so 5+ more buckets drop in for free.
// ─────────────────────────────────────────────────────────────────────────

// Accent dot color per tone token. Add a color once; any bucket can reuse it.
const ACCENT_DOT = {
  sky: 'bg-sky-500',
  slate: 'bg-slate-400',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  teal: 'bg-teal-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  cyan: 'bg-cyan-500',
  fuchsia: 'bg-fuchsia-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
}
const dotFor = (tone) => ACCENT_DOT[tone] || 'bg-slate-400'

// Icon registry — buckets reference an icon by string `iconName` in the data.
// Register a lucide icon here once and it is available to every bucket.
const ICONS = {
  arrowUp: ArrowUpNarrowWide,
  lock: Lock,
  puzzle: Puzzle,
  alert: AlertOctagon,
  ruler: Ruler,
  warehouse: Warehouse,
  network: Network,
  timer: Timer,
  packageX: PackageX,
  dollar: DollarSign,
  store: Store,
  triangle: TriangleAlert,
  folder: FolderTree,
}
const iconFor = (name) => ICONS[name] || FolderTree

function CopyButton({ value, message, label = 'Copy combination' }) {
  const push = useToast()
  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(value).catch(() => {})
    push(message)
  }
  return (
    <button
      onClick={handleCopy}
      title={label}
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover/node:opacity-100"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  )
}

// Drawer chrome is intentionally neutral/uniform across every bucket — the
// only per-bucket color is the accent dot (see ACCENT_DOT). Shared once so new
// buckets need no styling work.
const DRAWER_STYLE = {
  header: 'text-slate-800',
  badge: 'bg-slate-100 text-slate-600',
  border: 'border-slate-300',
  headerBg: 'bg-slate-50',
  chip: 'bg-slate-100',
  stripe: '',
}

const statusToneMap = {
  critical: 'bg-slate-100 text-slate-700 border border-slate-200',
  warning: 'bg-slate-100 text-slate-700 border border-slate-200',
}

const statusDotMap = {
  critical: 'bg-rose-500',
  warning: 'bg-amber-500',
}

function StoreRow({ store, index, planId, styleCode, styleGroup }) {
  const combo = `${planId} / ${styleCode} (${styleGroup}) / ${store.id} ${store.name} / Sizes: ${store.sizes}`
  return (
    <div
      className="group/node relative flex animate-nodeIn items-center gap-2 rounded-md py-1 pl-7 pr-1 transition hover:bg-slate-50"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span className="absolute left-2 top-1/2 h-px w-3 -translate-y-1/2 bg-slate-300" />
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-400">
        <Store className="h-3.5 w-3.5" />
      </span>
      <Tooltip content={store.note} width="w-72">
        <span className="cursor-help font-mono text-xs text-slate-600 underline decoration-dotted decoration-slate-300 underline-offset-2 transition hover:text-slate-900">
          {store.id} {store.name}
        </span>
      </Tooltip>
      <span className="text-slate-300">→</span>
      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700">
        {store.units}
      </span>
      <span className="text-xs text-slate-400">(Sizes: {store.sizes})</span>
      <span className="ml-auto">
        <CopyButton
          value={combo}
          message={`Copied Plan/Store/Style-Color combination: ${combo}`}
          label="Copy Plan / Store / Style-Color combination"
        />
      </span>
    </div>
  )
}

function StyleNode({ style, index, planId, bucketId }) {
  const [open, setOpen] = useState(false)
  const combo = `${planId} / ${style.code} (${style.group})`
  const visibleStores = style.stores.slice(0, MAX_STORES)
  return (
    <div className="relative animate-nodeIn pl-6" style={{ animationDelay: `${index * 70}ms` }}>
      <span className="absolute left-2 top-4 h-px w-3 bg-slate-300" />
      <div
        className={`group/node flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 transition ${
          open ? 'bg-slate-100/70' : 'hover:bg-slate-50'
        }`}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-90 text-slate-600' : ''}`}
          />
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            Style-Color
          </span>
          <span className="font-mono text-xs font-semibold text-slate-700">{style.code}</span>
          <span className="text-xs text-slate-400">({style.group})</span>
          <span className="text-xs text-slate-500">── {style.summary}</span>
        </button>
        <CopyButton
          value={combo}
          message={`Copied Plan/Style-Color combination: ${combo}`}
          label="Copy Plan / Style-Color combination"
        />
      </div>
      {open && (
        <div className="relative ml-3 mt-0.5">
          <span className="absolute left-0 top-0 h-full w-px origin-top animate-growLine bg-gradient-to-b from-slate-300 to-transparent" />
          {visibleStores.map((s, i) => (
            <StoreRow
              key={i}
              store={s}
              index={i}
              planId={planId}
              styleCode={style.code}
              styleGroup={style.group}
            />
          ))}
          <TruncationFooter
            shown={MAX_STORES}
            total={style.stores.length}
            noun="stores"
            bucketId={bucketId}
            indent="pl-7"
          />
        </div>
      )}
    </div>
  )
}

function PlanNode({ plan, defaultOpen, index, bucketId }) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = getPlanMeta(plan.id)
  const visibleStyles = plan.styles.slice(0, MAX_STYLES)
  return (
    <div className="animate-nodeIn" style={{ animationDelay: `${index * 90}ms` }}>
      <div
        className={`group/node flex w-full flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border px-2.5 py-2 transition ${
          open ? 'border-slate-300 bg-white shadow-sm' : 'border-transparent hover:bg-slate-100/70'
        }`}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          <ChevronRight
            className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Plan
          </span>
          <span className="font-mono text-sm font-bold text-slate-800">{plan.id}</span>
          <span className="text-xs text-slate-500">({plan.summary})</span>
        </button>
        <PlanMetrics meta={meta} />
        <CopyButton
          value={plan.id}
          message={`Copied Plan ID: ${plan.id}`}
          label="Copy Plan ID"
        />
      </div>
      {open && (
        <div className="relative ml-4 mt-1">
          <span className="absolute left-0 top-0 h-full w-px origin-top animate-growLine bg-gradient-to-b from-slate-300 to-transparent" />
          {visibleStyles.map((style, i) => (
            <StyleNode key={i} style={style} index={i} planId={plan.id} bucketId={bucketId} />
          ))}
          <TruncationFooter
            shown={MAX_STYLES}
            total={plan.styles.length}
            noun="style-colors"
            bucketId={bucketId}
            indent="pl-6"
          />
        </div>
      )}
    </div>
  )
}

// Cross-DC sourcing flow: primary DC drawn past its safe bound (pulsing red)
// feeding a secondary DC fallback draw. Only renders when dcFlow is present.
function DcSourcingFlow({ dcFlow }) {
  if (!dcFlow) return null
  const { primary, secondary } = dcFlow
  const primaryCritical = primary.drawnPct >= 100
  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/70 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Network className="h-3.5 w-3.5 text-slate-400" />
        Multi-DC Sourcing Flow
      </div>
      <div className="flex items-stretch gap-2">
        {/* Primary DC — over-bound / exhausted */}
        <div className="relative flex-1 overflow-hidden rounded-lg border border-rose-200 bg-rose-50/70 p-2.5">
          {primaryCritical && (
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-xs font-bold text-slate-700">{primary.name}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold tabular-nums text-rose-600">{primary.drawnPct}%</span>
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-700">
              {primary.status}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-rose-100">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-rose-500 to-red-600"
              style={{ width: `${Math.min(primary.drawnPct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] font-medium text-rose-600">Drawn past safe bound (100%)</p>
        </div>

        {/* Flow arrow */}
        <div className="flex flex-col items-center justify-center px-1">
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Fallback</span>
          <ArrowRight className="h-5 w-5 animate-pulse text-slate-400" />
          <span className="text-[10px] font-bold tabular-nums text-violet-600">+{secondary.drawUnits}</span>
        </div>

        {/* Secondary DC — fallback draw */}
        <div className="flex-1 overflow-hidden rounded-lg border border-violet-200 bg-violet-50/60 p-2.5">
          <div className="flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs font-bold text-slate-700">{secondary.name}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold tabular-nums text-violet-600">
              {secondary.drawUnits.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">units drawn</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600"
              style={{ width: `${secondary.drawPct}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] font-medium text-violet-600">
            {secondary.drawPct}% of cycle draw · cross-DC lead time
          </p>
        </div>
      </div>
    </div>
  )
}

function PoTable({ rows, dcFlow }) {
  const push = useToast()
  const copyPo = (po) => {
    navigator.clipboard?.writeText(po).catch(() => {})
    push('PO copied. Paste into your procurement tool to expedite shipment.')
  }
  return (
    <div>
      <DcSourcingFlow dcFlow={dcFlow} />
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Affected Style-Color</th>
              <th className="px-4 py-2.5 font-semibold">Network Status</th>
              <th className="px-4 py-2.5 font-semibold">DC Sourcing</th>
              <th className="px-4 py-2.5 font-semibold">Target Dispatch PO to Expedite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="bg-white transition hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <span className="mr-1.5">{row.icon}</span>
                  <span className="font-mono font-semibold text-slate-700">{row.style}</span>
                  <span className="ml-1 text-xs text-slate-400">({row.group})</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusToneMap[row.statusTone]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotMap[row.statusTone]}`} />
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {row.primaryDc && (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        <Warehouse className="h-3 w-3 opacity-70" />
                        {row.primaryDc}
                        <span className="rounded-full bg-rose-100 px-1 font-bold uppercase">
                          {row.primaryDcStatus}
                        </span>
                      </span>
                    )}
                    {row.sourcedFrom && (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                        <ArrowRight className="h-3 w-3 opacity-70" />
                        Sourced from {row.sourcedFrom} · +{row.fallbackUnits}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-700">{row.po}</span>
                    <button
                      onClick={() => copyPo(row.po)}
                      title="Copy ID"
                      className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs text-slate-400">
                      (ETA: {row.eta} / {row.channel})
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Store capacity utilization: stacked bar of On Hand / On Order / In Transit /
// New Allocation against the store's capacity ceiling. Highlights soft breaches.
const capacitySegments = [
  { key: 'onHand', label: 'On Hand', color: 'bg-gradient-to-b from-slate-300 to-slate-400', dot: 'bg-slate-400' },
  { key: 'onOrder', label: 'On Order', color: 'bg-gradient-to-b from-sky-300 to-sky-500', dot: 'bg-sky-400' },
  { key: 'inTransit', label: 'In Transit', color: 'bg-gradient-to-b from-indigo-300 to-indigo-500', dot: 'bg-indigo-400' },
  { key: 'newAllocation', label: 'New Allocation', color: 'bg-gradient-to-b from-amber-300 to-amber-500', dot: 'bg-amber-400' },
]

// Compact radial gauge showing utilization %. Ring color tracks the status band.
function CapacityGauge({ util, over, near }) {
  const r = 20
  const c = 2 * Math.PI * r
  const pct = Math.min(util, 100)
  const dash = (pct / 100) * c
  const stroke = over ? '#e11d48' : near ? '#d97706' : '#059669'
  return (
    <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
      <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
          style={over ? { filter: 'drop-shadow(0 0 3px rgba(225,29,72,0.6))' } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-[13px] font-extrabold leading-none tabular-nums ${
            over ? 'text-rose-600' : near ? 'text-amber-600' : 'text-emerald-600'
          }`}
        >
          {util.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

function CapacityRow({ row, index }) {
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  const util = (projected / row.capacity) * 100
  const over = util >= 100
  const near = util >= 90 && util < 100
  const scale = Math.max(util, 100) // baseline for widths so 100% ceiling maps consistently
  const ceilingLeft = (row.capacity / scale) * 100
  const overflowUnits = Math.max(projected - row.capacity, 0)
  const headroomUnits = Math.max(row.capacity - projected, 0)
  return (
    <div
      className={`group/cap animate-nodeIn overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50/60 p-3.5 shadow-premium ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg ${
        over ? 'border-rose-200' : near ? 'border-amber-200' : 'border-slate-200/80'
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3">
        <CapacityGauge util={util} over={over} near={near} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md ${
                over ? 'bg-rose-100 text-rose-600' : near ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-sm font-bold text-slate-800">{row.id}</span>
            <span className="text-xs text-slate-400">{row.name}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              {row.plans}
            </span>
            <span
              className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                over
                  ? 'border border-rose-300 bg-gradient-to-r from-rose-500 to-red-600 text-white animate-overflowPulse'
                  : near
                    ? 'border border-amber-300 bg-amber-50 text-amber-700'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {over && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              )}
              {over ? 'Over Capacity' : near ? 'Near Capacity' : 'Within Limit'}
            </span>
          </div>

          {/* Stacked capacity bar with ceiling marker + overflow spill zone */}
          <div className="relative mt-2.5 h-5 w-full rounded-full bg-slate-100 shadow-inner">
            {/* Over-capacity spill zone (beyond ceiling) subtly hatched in red */}
            {over && (
              <span
                className="absolute top-0 h-full rounded-r-full bg-[repeating-linear-gradient(45deg,rgba(244,63,94,0.18),rgba(244,63,94,0.18)_5px,rgba(244,63,94,0.06)_5px,rgba(244,63,94,0.06)_10px)]"
                style={{ left: `${ceilingLeft}%`, right: 0 }}
              />
            )}
            <div className="flex h-full w-full overflow-hidden rounded-full">
              {capacitySegments.map((seg) => (
                <span
                  key={seg.key}
                  className={`${seg.color} h-full origin-left animate-barFill`}
                  style={{ width: `${(row[seg.key] / scale) * 100}%`, animationDelay: `${index * 80 + 120}ms` }}
                  title={`${seg.label}: ${row[seg.key].toLocaleString()} units`}
                />
              ))}
            </div>
            {/* Capacity ceiling marker */}
            <span
              className={`absolute -top-1 bottom-[-4px] w-0.5 rounded ${over ? 'bg-rose-600' : 'bg-slate-700'}`}
              style={{ left: `${ceilingLeft}%` }}
              title={`Capacity ceiling: ${row.capacity.toLocaleString()} units`}
            />
            <span
              className={`absolute -top-[18px] -translate-x-1/2 whitespace-nowrap rounded px-1 text-[9px] font-bold uppercase tracking-wide ${
                over ? 'text-rose-600' : 'text-slate-500'
              }`}
              style={{ left: `${ceilingLeft}%` }}
            >
              Ceiling
            </span>
          </div>
        </div>
      </div>

      {/* Legend + projected / headroom / overflow readout */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {capacitySegments.map((seg) => (
          <span
            key={seg.key}
            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200/70"
          >
            <span className={`h-2 w-2 rounded-sm ${seg.dot}`} />
            {seg.label}
            <span className="font-semibold tabular-nums text-slate-700">{row[seg.key].toLocaleString()}</span>
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
          <span className="text-slate-400">Projected</span>
          <span className="tabular-nums text-slate-800">{projected.toLocaleString()}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400">Cap</span>
          <span className="tabular-nums text-slate-800">{row.capacity.toLocaleString()}</span>
          {over ? (
            <span className="ml-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
              +{overflowUnits.toLocaleString()} over
            </span>
          ) : (
            <span className="ml-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {headroomUnits.toLocaleString()} headroom
            </span>
          )}
        </span>
      </div>

      {row.note && (
        <p className={`mt-2.5 flex items-start gap-1.5 text-[11px] ${over ? 'text-rose-600' : 'text-slate-500'}`}>
          <TriangleAlert className="mt-0.5 h-3 w-3 flex-shrink-0" />
          {row.note}
        </p>
      )}
    </div>
  )
}

function CapacityTable({ rows }) {
  const over = rows.filter((r) => (r.onHand + r.onOrder + r.inTransit + r.newAllocation) / r.capacity >= 1).length
  const near = rows.filter((r) => {
    const u = (r.onHand + r.onOrder + r.inTransit + r.newAllocation) / r.capacity
    return u >= 0.9 && u < 1
  }).length
  const within = rows.length - over - near
  const summary = [
    { label: 'Over Capacity', count: over, dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Near Capacity', count: near, dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Within Limit', count: within, dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  ]
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {summary.map((s) => (
          <span
            key={s.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
          >
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            {s.count} {s.label}
          </span>
        ))}
      </div>
      {rows.map((row, i) => (
        <CapacityRow key={row.id} row={row} index={i} />
      ))}
    </div>
  )
}

function InsightDrawer({ item, open, onToggle, innerRef }) {
  const tone = DRAWER_STYLE
  const DrawerIcon = iconFor(item.iconName)
  const accentDot = dotFor(item.tone)
  const push = useToast()
  const exportBucket = (e) => {
    e.stopPropagation()
    const lines = buildInsightExport(item.id)
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {})
    push(`Exported ${item.title} (${lines.length - 1} rows) to clipboard as CSV.`)
  }
  return (
    <div
      ref={innerRef}
      className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
        open ? `${tone.border} shadow-premium-lg ${tone.stripe}` : 'border-slate-200/80 shadow-premium ring-1 ring-white/50 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-premium-lg'
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-2.5 px-4 py-3.5 text-left transition ${open ? tone.headerBg : 'hover:bg-slate-50/70'}`}
      >
        <span
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 shadow-inner ring-1 ring-slate-200/60 transition-transform duration-300 ${tone.chip} ${open ? 'scale-105' : ''}`}
        >
          <DrawerIcon className="h-4 w-4" />
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${accentDot}`}
          />
        </span>
        <span className={`text-sm font-bold uppercase tracking-wide ${open ? tone.header : 'text-slate-700'}`}>
          {item.title}
        </span>
        {typeof item.planCount === 'number' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
            {item.planCount} {item.planCount === 1 ? 'Plan' : 'Plans'}
          </span>
        )}
        {item.subtitle && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 shadow-[0_0_10px_1px_rgba(244,63,94,0.25)] animate-pulseRail">
            {item.subtitle}
          </span>
        )}
        <ChevronRight
          className={`ml-auto h-4 w-4 flex-shrink-0 transition-transform duration-300 ${
            open ? `rotate-90 ${tone.header}` : 'text-slate-400'
          }`}
        />
      </button>

      {open && (
        <div className="animate-drawerIn border-t border-slate-100 px-4 py-4">
          <p className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Macro Impact:</span>
            <span className={`rounded-md px-2 py-0.5 font-medium ${tone.badge}`}>{item.macro}</span>
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <FolderTree className="h-4 w-4" />
              {item.directoryTitle}
              <span className="font-normal normal-case text-slate-400">— {item.directoryHint}</span>
              <button
                onClick={exportBucket}
                title="Export this directory as CSV"
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold normal-case tracking-normal text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>

            {item.type === 'poTable' ? (
              <PoTable rows={item.rows} dcFlow={item.dcFlow} />
            ) : item.type === 'capacityTable' ? (
              <CapacityTable rows={item.rows} />
            ) : (
              <div className="space-y-1 font-sans">
                {rankPlans(item.plans)
                  .slice(0, MAX_PLANS)
                  .map((plan, i) => (
                    <PlanNode
                      key={plan.id}
                      plan={plan}
                      defaultOpen={i === 0}
                      index={i}
                      bucketId={item.id}
                    />
                  ))}
                <TruncationFooter
                  shown={MAX_PLANS}
                  total={item.plans.length}
                  noun="plans"
                  bucketId={item.id}
                  sortBasis="revenue at risk"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const InsightsStudio = forwardRef(function InsightsStudio({ openMap, onToggle, refs }, ref) {
  return (
    <section ref={ref}>
      <SectionHeader
        icon={FolderTree}
        title="Insight Handbook"
        subtitle="Plan metrics · relational directories · export"
      />
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-premium ring-1 ring-white/50 backdrop-blur-sm">
        {insights.map((item) => (
          <InsightDrawer
            key={item.id}
            item={item}
            open={!!openMap[item.id]}
            onToggle={() => onToggle(item.id)}
            innerRef={refs[item.id]}
          />
        ))}
      </div>
    </section>
  )
})

export default InsightsStudio
