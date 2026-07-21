import { forwardRef, useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
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
  TrendingDown,
  TrendingUp,
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
  PauseCircle,
  SlidersHorizontal,
} from 'lucide-react'
import { insightCards, getPlanMeta, buildInsightExport } from '../data/mockData'
import Tooltip from './Tooltip'
import { useToast } from './Toast'
import SectionHeader from './SectionHeader'

// Severity drives the card ring/dot + label chip. The icon itself still comes
// from the per-bucket iconName/tone registries below.
const severityMap = {
  critical: {
    dot: 'bg-rose-500',
    glow: 'shadow-[0_0_8px_1px_rgba(244,63,94,0.5)]',
    label: 'Critical',
    labelChip: 'bg-rose-50 text-rose-600 border-rose-200',
    ring: 'border-rose-200',
  },
  warning: {
    dot: 'bg-amber-500',
    glow: 'shadow-[0_0_8px_1px_rgba(245,158,11,0.5)]',
    label: 'Warning',
    labelChip: 'bg-amber-50 text-amber-600 border-amber-200',
    ring: 'border-amber-200',
  },
}

// What → Why → Next Step narrative (folded in from the old Playbook card).
const actionSteps = [
  { key: 'what', label: 'What', num: '1' },
  { key: 'why', label: 'Why', num: '2' },
  { key: 'next', label: 'Next Step', num: '3' },
]

function ActionBlock({ item }) {
  if (!item.what && !item.why && !item.next) return null
  return (
    <div className="space-y-3">
      {actionSteps.map((step) =>
        item[step.key] ? (
          <div key={step.key} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10">
              {step.num}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {step.label}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{item[step.key]}</p>
            </div>
          </div>
        ) : null,
      )}

      {item.lostSales && (
        <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-slate-50 p-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 flex-shrink-0 text-rose-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Lost Sales if Not Released
            </p>
            {item.lostSalesValue && (
              <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-100">
                {item.lostSalesValue}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.lostSales}</p>
        </div>
      )}
    </div>
  )
}

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
const MAX_STYLES = 10
const MAX_STORES = 10

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

// Rank style-colors by the impact figure embedded in their summary (e.g.
// "(+640 units)") so the visible top-N are the highest-impact ones.
function rankStyles(styles) {
  return [...styles].sort((a, b) => toNum(b.summary) - toNum(a.summary))
}

// Rank stores by their unit impact (e.g. "+420 units") — highest first.
function rankStores(stores) {
  return [...stores].sort((a, b) => toNum(b.units) - toNum(a.units))
}

// The ONE unified Export-all control used everywhere (evidence toggle row,
// directory header fallback, and the truncation CTA) so the action reads
// identically top and bottom. Premium dark pill with an indigo edge glow and
// a sheen sweep on hover. `size` tunes padding for tight vs. roomy spots.
function ExportAllButton({ onExport, title, size = 'md', label = 'Export all', className = '' }) {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <button
      onClick={onExport}
      title={title}
      className={`group/exp relative inline-flex flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 ${pad} font-bold text-white shadow-md ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-indigo-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/exp:translate-x-full" />
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-sky-500/0 opacity-0 transition-opacity duration-300 group-hover/exp:opacity-100" />
      <Download className={`relative ${icon}`} />
      <span className="relative">{label}</span>
    </button>
  )
}

// Impact-cap indicator, shown at every level (plans / style-colors / stores)
// when a list is truncated. It is a premium "get the rest" CTA: it makes the
// top-N ranking unmistakable AND offers a one-click export of the COMPLETE,
// impact-ranked set. Clicking it fires the same single card export.
function TruncationFooter({ shown, total, noun, indent = '', onExport }) {
  if (total <= shown) return null
  const remaining = total - shown
  return (
    <div className={`mt-2 ${indent}`}>
      <button
        onClick={onExport}
        title={`Export the complete, impact-ranked list of all ${total} ${noun} — including the ${remaining} beyond the top ${shown} shown here`}
        className="group/more relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-white px-3 py-2 text-left shadow-sm ring-1 ring-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-premium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {/* sheen sweep on hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover/more:translate-x-full" />
        <span className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm ring-1 ring-white/40">
          <Layers className="h-3.5 w-3.5" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
            <ArrowUpNarrowWide className="h-3 w-3 text-indigo-500" />
            Top {shown} by impact
            <span className="rounded-full bg-indigo-100 px-1.5 py-px text-[10px] font-extrabold text-indigo-700">
              +{remaining} more
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">
            Export the complete list of all {total} {noun} — impact-ranked
          </span>
        </span>
        <span className="relative flex flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-md ring-1 ring-white/10 transition-all group-hover/more:-translate-y-0.5 group-hover/more:shadow-lg group-hover/more:ring-indigo-400/50">
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/more:translate-x-full" />
          <Download className="relative h-3.5 w-3.5" />
          <span className="relative">Export all</span>
        </span>
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

function StyleNode({ style, index, planId, bucketId, onExport }) {
  const [open, setOpen] = useState(false)
  const combo = `${planId} / ${style.code} (${style.group})`
  const visibleStores = rankStores(style.stores).slice(0, MAX_STORES)
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
            indent="pl-7"
            onExport={onExport}
          />
        </div>
      )}
    </div>
  )
}

function PlanNode({ plan, defaultOpen, index, bucketId, onExport }) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = getPlanMeta(plan.id)
  const visibleStyles = rankStyles(plan.styles).slice(0, MAX_STYLES)
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
            <StyleNode key={i} style={style} index={i} planId={plan.id} bucketId={bucketId} onExport={onExport} />
          ))}
          <TruncationFooter
            shown={MAX_STYLES}
            total={plan.styles.length}
            noun="style-colors"
            indent="pl-6"
            onExport={onExport}
          />
        </div>
      )}
    </div>
  )
}

// A single DC panel inside the Multi-DC overview. Renders role, name, the
// capped % consumed with a proportional gauge, a status pill and a supporting
// exhaustion/headroom readout. `tone` drives the rose (exhausted) vs violet
// (fallback) palette so primary/secondary read instantly.
function DcPanel({ dc, tone, critical, footer }) {
  const T =
    tone === 'rose'
      ? {
          border: 'border-rose-200',
          bg: 'from-rose-50/80 to-white',
          icon: 'text-rose-500',
          value: 'text-rose-600',
          track: 'bg-rose-100',
          fill: 'from-rose-500 to-red-600',
          pill: 'bg-rose-100 text-rose-700',
          foot: 'text-rose-600',
        }
      : {
          border: 'border-violet-200',
          bg: 'from-violet-50/70 to-white',
          icon: 'text-violet-500',
          value: 'text-violet-600',
          track: 'bg-violet-100',
          fill: 'from-violet-400 to-violet-600',
          pill: 'bg-violet-100 text-violet-700',
          foot: 'text-violet-600',
        }
  return (
    <div className={`relative flex-1 overflow-hidden rounded-xl border ${T.border} bg-gradient-to-b ${T.bg} p-3 shadow-sm ring-1 ring-white/50`}>
      {critical && (
        <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <span className={`rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200`}>
          {dc.role}
        </span>
        <Warehouse className={`h-3.5 w-3.5 ${T.icon}`} />
        <span className="truncate text-xs font-bold text-slate-700">{dc.name}</span>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="flex flex-col leading-none">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">% Consumed</span>
          <span className={`mt-1 text-2xl font-extrabold tabular-nums ${T.value}`}>{dc.consumedPct}%</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${T.pill}`}>
          {dc.status}
        </span>
      </div>
      <div className={`mt-2 h-2 w-full overflow-hidden rounded-full ${T.track}`}>
        <span
          className={`block h-full rounded-full bg-gradient-to-r ${T.fill}`}
          style={{ width: `${Math.min(dc.consumedPct, 100)}%` }}
        />
      </div>
      <p className={`mt-1.5 text-[10px] font-medium ${T.foot}`}>{footer}</p>
    </div>
  )
}

// Cross-DC sourcing flow: a network overview strip (total DCs, exhausted count,
// network consumption, fallback units) above two DC panels — primary drawn past
// its safe bound feeding a secondary fallback draw. Only renders with dcFlow.
function DcSourcingFlow({ dcFlow }) {
  if (!dcFlow) return null
  const { primary, secondary, overview } = dcFlow
  const primaryCritical = primary.drawnPct >= 100 || primary.consumedPct >= 100
  const overviewStats = overview
    ? [
        { label: 'DCs in Network', value: overview.totalDcs, tone: 'text-slate-800' },
        { label: 'DCs Exhausted', value: overview.exhaustedDcs, tone: 'text-rose-600' },
        { label: 'Network Consumed', value: `${overview.networkConsumedPct}%`, tone: 'text-slate-800' },
        { label: 'Fallback Units', value: `+${overview.fallbackUnits.toLocaleString()}`, tone: 'text-violet-600' },
      ]
    : []
  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/70 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Network className="h-3.5 w-3.5 text-slate-400" />
        Multi-DC Sourcing Flow
      </div>

      {/* Network overview strip */}
      {overviewStats.length > 0 && (
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-100 sm:grid-cols-4 sm:divide-y-0">
          {overviewStats.map((s) => (
            <div key={s.label} className="px-3 py-2">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{s.label}</div>
              <div className={`mt-0.5 text-sm font-extrabold tabular-nums ${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* DC panels + fallback flow */}
      <div className="flex items-stretch gap-2 p-3">
        <DcPanel
          dc={primary}
          tone="rose"
          critical={primaryCritical}
          footer={`Drawn ${primary.drawnPct}% of safe bound — exhausted (capped at 100%)`}
        />

        <div className="flex flex-col items-center justify-center px-1">
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Fallback</span>
          <ArrowRight className="h-5 w-5 animate-pulse text-slate-400" />
          <span className="text-[10px] font-bold tabular-nums text-violet-600">
            +{secondary.drawUnits.toLocaleString()}
          </span>
        </div>

        <DcPanel
          dc={secondary}
          tone="violet"
          critical={false}
          footer={`${secondary.drawUnits.toLocaleString()} units drawn · ${100 - secondary.consumedPct}% headroom remaining`}
        />
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

// Store Velocity is read through a Forward-Weeks-of-Supply (FWOS) cover lens:
// more forward cover is safer, thin cover is stockout risk.
//   FWOS > 20  → Healthy      (ample forward cover)
//   FWOS 10–20 → Fine         (adequate cover, monitor)
//   FWOS < 10  → Needs Review (thin cover, stockout risk)
const FWOS_HEALTHY = 20
const FWOS_FINE_MIN = 10

// Classify a store's aggregate FWOS into a cover-health verdict.
function velocityStatus(fwos) {
  if (fwos > FWOS_HEALTHY)
    return { key: 'healthy', label: 'Healthy', sub: '>20 FWOS · ample cover', tone: 'emerald', flag: false }
  if (fwos >= FWOS_FINE_MIN)
    return { key: 'fine', label: 'Fine', sub: '10–20 FWOS · adequate cover', tone: 'sky', flag: false }
  return { key: 'review', label: 'Needs Review', sub: '<10 FWOS · thin cover', tone: 'amber', flag: true }
}

// Lower FWOS = thinner cover = higher review priority. Used to rank the
// velocity view worst-first (Needs Review at the top).
function fwosReviewPriority(fwos) {
  return Math.max(FWOS_FINE_MIN - fwos, 0)
}

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

// Indicator 1 — Physical Space. Radial gauge + stacked inventory bar with a
// 100% ceiling marker and red diagonal hatching for the overflow spill zone.
function PhysicalSpaceIndicator({ row, index, over, near, util }) {
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  const scale = Math.max(util, 100) // baseline so the 100% ceiling maps consistently
  const ceilingLeft = (row.capacity / scale) * 100
  const overflowUnits = Math.max(projected - row.capacity, 0)
  const headroomUnits = Math.max(row.capacity - projected, 0)
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Physical Space</span>
        {over ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
            +{overflowUnits.toLocaleString()} over
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            {headroomUnits.toLocaleString()} headroom
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <CapacityGauge util={util} over={over} near={near} />
        <div className="min-w-0 flex-1">
          {/* Stacked capacity bar with ceiling marker + overflow spill zone */}
          <div className="relative mt-3 h-5 w-full rounded-full bg-slate-100 shadow-inner">
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
            <span
              className={`absolute -top-1 bottom-[-4px] w-0.5 rounded ${over ? 'bg-rose-600' : 'bg-slate-700'}`}
              style={{ left: `${ceilingLeft}%` }}
              title={`Capacity ceiling: ${row.capacity.toLocaleString()} units`}
            />
            <span
              className={`absolute -top-[18px] -translate-x-1/2 whitespace-nowrap px-1 text-[9px] font-bold uppercase tracking-wide ${
                over ? 'text-rose-600' : 'text-slate-500'
              }`}
              style={{ left: `${ceilingLeft}%` }}
            >
              Ceiling
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="text-slate-400">Fill</span>
            <span className="tabular-nums text-slate-800">{projected.toLocaleString()}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Cap</span>
            <span className="tabular-nums text-slate-800">{row.capacity.toLocaleString()}</span>
          </div>
        </div>
      </div>
      {/* Inventory legend */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {capacitySegments.map((seg) => (
          <span
            key={seg.key}
            className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[9.5px] text-slate-500 ring-1 ring-slate-200/70"
          >
            <span className={`h-1.5 w-1.5 rounded-sm ${seg.dot}`} />
            {seg.label}
            <span className="font-semibold tabular-nums text-slate-700">{row[seg.key].toLocaleString()}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Indicator 2 — Total Store Velocity. Aggregate FWOS on a 3-zone band scale
// (Needs Review / Fine / Healthy) with a marker, a status chip and a cover
// readout.
const velocityToneMap = {
  amber: { text: 'text-amber-600', chip: 'bg-amber-100 text-amber-700', fill: 'bg-amber-500', border: 'border-amber-200 bg-amber-50/50' },
  sky: { text: 'text-sky-600', chip: 'bg-sky-100 text-sky-700', fill: 'bg-sky-500', border: 'border-sky-200 bg-sky-50/40' },
  emerald: { text: 'text-emerald-600', chip: 'bg-emerald-100 text-emerald-700', fill: 'bg-emerald-500', border: 'border-emerald-200 bg-emerald-50/40' },
}

const FWOS_SCALE_MAX = 28 // FWOS scale ceiling for the band bar

function StoreVelocityIndicator({ row }) {
  const fwos = row.storeWos
  const vs = velocityStatus(fwos)
  const T = velocityToneMap[vs.tone]
  const clamp = (v) => Math.min(Math.max(v, 0), 100)
  const markerLeft = clamp((fwos / FWOS_SCALE_MAX) * 100)
  const reviewW = (FWOS_FINE_MIN / FWOS_SCALE_MAX) * 100
  const fineW = ((FWOS_HEALTHY - FWOS_FINE_MIN) / FWOS_SCALE_MAX) * 100
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  return (
    <div className={`rounded-xl border p-3 ${T.border}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Store Velocity · FWOS</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${T.chip}`}>
          {vs.label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col leading-none">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Forward Cover</span>
          <span className={`mt-1 text-2xl font-extrabold tabular-nums ${T.text}`}>
            {fwos}
            <span className="ml-1 text-[11px] font-bold text-slate-400">FWOS</span>
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-400">Review &lt;10 · Fine 10–20 · Healthy &gt;20</span>
      </div>
      {/* 3-zone band scale (Review / Fine / Healthy) with FWOS marker */}
      <div className="relative mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <span className="h-full bg-amber-200/70" style={{ width: `${reviewW}%` }} title="Needs Review <10 FWOS" />
        <span className="h-full bg-sky-200/70" style={{ width: `${fineW}%` }} title="Fine 10–20 FWOS" />
        <span className="h-full flex-1 bg-emerald-200/70" title="Healthy >20 FWOS" />
      </div>
      <div className="relative">
        <span
          className={`absolute -top-3 h-3 w-1 -translate-x-1/2 rounded-full ${T.fill} ring-2 ring-white`}
          style={{ left: `${markerLeft}%` }}
          title={`Aggregate Store FWOS: ${fwos}`}
        />
      </div>
      <p className="mt-2.5 text-[10px] font-medium text-slate-500">
        {vs.key === 'review'
          ? `Thin forward cover — ${fwos} FWOS on ${row.weeklySales.toLocaleString()} wk sales; review replen before stockout.`
          : vs.key === 'fine'
            ? `Adequate cover — ${fwos} FWOS on ${row.weeklySales.toLocaleString()} wk sales; monitor.`
            : `Ample cover — ${fwos} FWOS across ${projected.toLocaleString()} replen units.`}
      </p>
    </div>
  )
}

// Shared store identifier header used by both drill-down views.
function StoreHeader({ row, iconTone, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${iconTone}`}>
        <Store className="h-3.5 w-3.5" />
      </span>
      <span className="font-mono text-sm font-bold text-slate-800">{row.id}</span>
      <span className="text-xs text-slate-400">{row.name}</span>
      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
        {row.tier}
      </span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{row.plans}</span>
      {children}
    </div>
  )
}

// Small pill for macro action triggers, scoped to a store's issue.
function MacroActionButton({ label, icon: AIcon, onRun }) {
  return (
    <button
      onClick={() => onRun(label)}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <AIcon className="h-3 w-3" />
      {label}
    </button>
  )
}

function useMacroAction(row) {
  const push = useToast()
  return (label) =>
    push(`${label} queued for ${row.id} (${row.tier}). Apply before the next dispatch to resolve this store.`)
}

// View 1 row — Capacity Breach focus (physical space only).
function CapacityBreachRow({ row, index }) {
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  const util = (projected / row.capacity) * 100
  const over = util >= 100
  const near = util >= 90 && util < 100
  const vs = velocityStatus(row.storeWos)
  const runAction = useMacroAction(row)
  return (
    <div
      className={`group/cap animate-nodeIn overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50/60 p-3.5 shadow-premium ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg ${
        over ? 'border-rose-200' : near ? 'border-amber-200' : 'border-slate-200/80'
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <StoreHeader row={row} iconTone={over ? 'bg-rose-100 text-rose-600' : near ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}>
        <span className="ml-auto flex items-center gap-1.5">
          {/* cross-reference FWOS chip */}
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${velocityToneMap[vs.tone].chip}`}>
            {row.storeWos} FWOS
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              over
                ? 'border border-rose-300 bg-gradient-to-r from-rose-500 to-red-600 text-white animate-overflowPulse'
                : near
                  ? 'border border-amber-300 bg-amber-50 text-amber-700'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {over ? 'Over Capacity' : near ? 'Near Capacity' : 'Within Limit'}
          </span>
        </span>
      </StoreHeader>
      <div className="mt-3">
        <PhysicalSpaceIndicator row={row} index={index} over={over} near={near} util={util} />
      </div>
      {(over || near) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Macro Actions</span>
          <MacroActionButton label="Trim Allocation" icon={TrendingDown} onRun={runAction} />
          <MacroActionButton label="Stagger Delivery" icon={Timer} onRun={runAction} />
        </div>
      )}
    </div>
  )
}

// View 2 row — Store Velocity (FWOS) focus.
function StoreVelocityRow({ row, index }) {
  const vs = velocityStatus(row.storeWos)
  const T = velocityToneMap[vs.tone]
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  const over = projected / row.capacity >= 1
  const runAction = useMacroAction(row)
  return (
    <div
      className={`group/cap animate-nodeIn overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50/60 p-3.5 shadow-premium ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg ${
        vs.key === 'review' ? 'border-amber-200' : 'border-slate-200/80'
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <StoreHeader row={row} iconTone={`${T.chip}`}>
        <span className="ml-auto flex items-center gap-1.5">
          {/* cross-reference capacity chip */}
          {over && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9.5px] font-bold text-rose-700">
              Over Capacity
            </span>
          )}
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${T.chip}`}>
            {vs.label}
          </span>
        </span>
      </StoreHeader>
      <div className="mt-3">
        <StoreVelocityIndicator row={row} />
      </div>
      {vs.key === 'review' && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Macro Actions</span>
          <MacroActionButton label="Review Replen" icon={PauseCircle} onRun={runAction} />
          <MacroActionButton label="Adjust Store Multiplier" icon={SlidersHorizontal} onRun={runAction} />
        </div>
      )}
    </div>
  )
}

// Physical breach % = total fill / capacity.
const capacityUtil = (r) => (r.onHand + r.onOrder + r.inTransit + r.newAllocation) / r.capacity

function CapacityTable({ rows, onExport }) {
  // Two separate lenses on the same stores, switchable via a segmented control.
  const [view, setView] = useState('capacity')

  const overPhysical = rows.filter((r) => capacityUtil(r) >= 1).length
  const nearPhysical = rows.filter((r) => capacityUtil(r) >= 0.9 && capacityUtil(r) < 1).length
  const withinPhysical = rows.length - overPhysical - nearPhysical
  const healthy = rows.filter((r) => velocityStatus(r.storeWos).key === 'healthy').length
  const fine = rows.filter((r) => velocityStatus(r.storeWos).key === 'fine').length
  const review = rows.filter((r) => velocityStatus(r.storeWos).key === 'review').length

  const views = [
    { key: 'capacity', label: 'Capacity Breach', icon: Warehouse, count: overPhysical },
    { key: 'velocity', label: 'Store Velocity · FWOS', icon: Timer, count: review },
  ]

  const capacitySummary = [
    { label: 'Over Capacity', count: overPhysical, dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Near Capacity', count: nearPhysical, dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Within Limit', count: withinPhysical, dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  ]
  const velocitySummary = [
    { label: 'Needs Review (<10)', count: review, dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Fine (10–20)', count: fine, dot: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
    { label: 'Healthy (>20)', count: healthy, dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  ]

  const isCapacity = view === 'capacity'
  const summary = isCapacity ? capacitySummary : velocitySummary
  const ranked = isCapacity
    ? [...rows].sort((a, b) => capacityUtil(b) - capacityUtil(a))
    : [...rows].sort((a, b) => fwosReviewPriority(a.storeWos) - fwosReviewPriority(b.storeWos) === 0 ? a.storeWos - b.storeWos : fwosReviewPriority(b.storeWos) - fwosReviewPriority(a.storeWos))
  const visible = ranked.slice(0, MAX_STORES)

  return (
    <div className="space-y-3">
      {/* Segmented view toggle — two separate lenses on the same stores */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/70 p-1 shadow-inner">
        {views.map((v) => {
          const VIcon = v.icon
          const active = view === v.key
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                active ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <VIcon className={`h-3.5 w-3.5 ${active ? 'text-indigo-500' : 'text-slate-400'}`} />
              {v.label}
              <span className={`rounded-full px-1.5 py-px text-[9.5px] font-extrabold ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                {v.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Summary chips for the active lens */}
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

      <div className="space-y-2.5">
        {visible.map((row, i) =>
          isCapacity ? (
            <CapacityBreachRow key={row.id} row={row} index={i} />
          ) : (
            <StoreVelocityRow key={row.id} row={row} index={i} />
          ),
        )}
      </div>
      <TruncationFooter shown={MAX_STORES} total={rows.length} noun="stores" onExport={onExport} />
    </div>
  )
}

// The unified insight card: collapsed summary → Action (What/Why/Next) →
// nested Evidence (drill-down + export). Combines the old Playbook narrative
// with the Handbook directory in one progressive-disclosure object.
function InsightDrawer({ item, open, onToggle, innerRef }) {
  const tone = DRAWER_STYLE
  const sev = severityMap[item.severity] || severityMap.warning
  const DrawerIcon = iconFor(item.iconName)
  const accentDot = dotFor(item.tone)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const push = useToast()
  const hasAction = Boolean(item.what || item.why || item.next)
  const isTree = item.type !== 'poTable' && item.type !== 'capacityTable'
  const totalPlans = item.plans?.length || 0
  const plansTruncated = isTree && totalPlans > MAX_PLANS
  const exportBucket = (e) => {
    e.stopPropagation()
    const lines = buildInsightExport(item.id)
    if (lines.length === 0) {
      push('No list available to export for this item.')
      return
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {})
    push(`Exported ${item.title} (${lines.length - 1} rows) to clipboard as CSV.`)
  }
  return (
    <div
      ref={innerRef}
      className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
        open ? `${sev.ring} shadow-premium-lg` : 'border-slate-200/80 shadow-premium ring-1 ring-white/50 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-premium-lg'
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center gap-2.5 px-4 py-3.5 text-left transition ${open ? tone.headerBg : 'hover:bg-slate-50/70'}`}
      >
        <span
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 shadow-inner ring-1 ring-slate-200/60 transition-transform duration-300 ${tone.chip} ${open ? 'scale-105' : ''}`}
        >
          <DrawerIcon className="h-4 w-4" />
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${sev.dot} ${sev.glow}`}
          />
        </span>
        <span className={`text-sm font-bold uppercase tracking-wide ${open ? tone.header : 'text-slate-700'}`}>
          {item.title}
        </span>
        {typeof item.planCount === 'number' && (
          <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm sm:inline-flex">
            <span className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
            {item.planCount} {item.planCount === 1 ? 'Plan' : 'Plans'}
          </span>
        )}
        {item.lostSalesValue && (
          <span className="hidden rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-bold text-rose-700 shadow-sm ring-1 ring-rose-100 sm:inline-block">
            {item.lostSalesValue}
          </span>
        )}
        <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${sev.labelChip}`}>
          {sev.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsed preview — the What one-liner (from the old Playbook card) */}
      {!open && hasAction && item.what && (
        <button onClick={onToggle} className="w-full px-4 pb-3.5 text-left">
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">What: </span>
            {item.what}
          </p>
          <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition hover:text-slate-600">
            <ChevronDown className="h-3 w-3" />
            Expand for Why → Next Step & evidence
          </span>
        </button>
      )}

      {open && (
        <div className="animate-drawerIn border-t border-slate-100 px-4 py-4">
          <p className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Macro Impact:</span>
            <span className={`rounded-md px-2 py-0.5 font-medium ${tone.badge}`}>{item.macro}</span>
          </p>

          {/* Action layer — What → Why → Next Step + lost-sales callout */}
          {hasAction && (
            <div className="mb-4">
              <ActionBlock item={item} />
            </div>
          )}

          {/* Evidence layer — the drill-down toggle paired with the unified
              top Export-all, since the export IS this affected-plans/stores list. */}
          <div
            className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs shadow-sm transition-all duration-300 ${
              evidenceOpen
                ? 'border-indigo-200/70 bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-white'
                : 'border-slate-200 bg-gradient-to-r from-slate-50 to-white hover:border-indigo-200/70 hover:from-indigo-50/50 hover:to-white'
            }`}
          >
            <button
              onClick={() => setEvidenceOpen((o) => !o)}
              aria-expanded={evidenceOpen}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left font-semibold text-slate-600 focus:outline-none"
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 transition-all duration-300 ${
                  evidenceOpen
                    ? 'bg-gradient-to-br from-indigo-500 to-sky-500 text-white ring-white/40'
                    : 'bg-white text-slate-400 ring-slate-200'
                }`}
              >
                <FolderTree className="h-3.5 w-3.5" />
              </span>
              <span className="uppercase tracking-wide">
                View affected {item.type === 'poTable' ? 'style-colors' : item.type === 'capacityTable' ? 'stores' : 'plans & stores'}
              </span>
              <span className="hidden truncate font-normal normal-case text-slate-400 sm:inline">
                — {item.directoryHint}
              </span>
              <ChevronRight
                className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${evidenceOpen ? 'rotate-90 text-indigo-500' : 'text-slate-400'}`}
              />
            </button>
            <ExportAllButton
              onExport={exportBucket}
              size="sm"
              title={`${item.trigger || `Export ${item.title} list`} — exports ALL records (every plan, style-color & store), not just the top-ranked ones shown`}
            />
          </div>

          {evidenceOpen && (
            <div className="animate-drawerIn mt-2 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-3 shadow-inner">
              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-indigo-500 shadow-sm ring-1 ring-slate-200">
                  <FolderTree className="h-3.5 w-3.5" />
                </span>
                {item.directoryTitle}
                {/* Scope indicator (not a button) — the single Export lives on the
                    'View affected plans & stores' row; this just clarifies scope. */}
                {isTree && totalPlans > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal shadow-sm ${
                      plansTruncated
                        ? 'border-indigo-200/70 bg-gradient-to-r from-indigo-50 to-sky-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    <ArrowUpNarrowWide className={`h-3 w-3 ${plansTruncated ? 'text-indigo-500' : 'text-slate-400'}`} />
                    {plansTruncated
                      ? `Top ${MAX_PLANS} of ${totalPlans} plans by impact`
                      : `All ${totalPlans} ${totalPlans === 1 ? 'plan' : 'plans'} by impact`}
                  </span>
                )}
                {/* Fallback export only when the toggle-row Export is absent
                    (i.e. the card has no Action narrative). */}
                {!hasAction && (
                  <ExportAllButton
                    onExport={exportBucket}
                    size="sm"
                    title="Export this directory as CSV — all records"
                    className="ml-auto"
                  />
                )}
              </div>

              {item.type === 'poTable' ? (
                <PoTable rows={item.rows} dcFlow={item.dcFlow} />
              ) : item.type === 'capacityTable' ? (
                <CapacityTable rows={item.rows} onExport={exportBucket} />
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
                        onExport={exportBucket}
                      />
                    ))}
                  {plansTruncated && (
                    <div className="mt-2 border-t border-dashed border-slate-200 pt-2">
                      <TruncationFooter shown={MAX_PLANS} total={totalPlans} noun="plans" onExport={exportBucket} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const InsightsStudio = forwardRef(function InsightsStudio(
  { openMap, onToggle, onToggleAll, refs },
  ref,
) {
  const criticalCount = insightCards.filter((c) => c.severity === 'critical').length
  const warningCount = insightCards.filter((c) => c.severity === 'warning').length
  const allOpen = insightCards.every((c) => openMap[c.id])

  return (
    <section ref={ref} className="scroll-mt-24">
      <SectionHeader
        icon={Sparkles}
        title="Insights & Smart Actions"
        subtitle="What → Why → Next Step · evidence · export"
      />
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium-lg ring-1 ring-white/50">
        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 overflow-hidden border-b border-white/5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <span className="pointer-events-none absolute -inset-24 opacity-40 aurora [background-image:radial-gradient(600px_180px_at_10%_-40%,rgba(99,102,241,0.5),transparent),radial-gradient(520px_180px_at_92%_140%,rgba(14,165,233,0.4),transparent),radial-gradient(420px_160px_at_55%_-20%,rgba(168,85,247,0.35),transparent)]" />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="relative flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-400/40 to-sky-400/30 opacity-70 blur-md" />
              <Sparkles className="relative h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-wide">Diagnostic Insights & Recommended Actions</p>
              <p className="text-[11px] text-slate-300">
                One card per issue — action narrative up top, drill-down evidence one click away
              </p>
            </div>
          </div>
          <div className="relative ml-auto flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="text-lg font-bold tabular-nums">{insightCards.length}</span>
              <span className="text-slate-300">Insights</span>
            </span>
            <span className="h-8 w-px bg-white/15" />
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_2px_rgba(251,113,133,0.6)]" />
              <span className="font-semibold tabular-nums">{criticalCount}</span>
              <span className="text-slate-300">Critical</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]" />
              <span className="font-semibold tabular-nums">{warningCount}</span>
              <span className="text-slate-300">Warning</span>
            </span>
            <span className="h-8 w-px bg-white/15" />
            <button
              onClick={() => onToggleAll(!allOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/20"
            >
              {allOpen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        </div>
        <div className="space-y-3 p-5">
          {insightCards.map((item) => (
            <InsightDrawer
              key={item.id}
              item={item}
              open={!!openMap[item.id]}
              onToggle={() => onToggle(item.id)}
              innerRef={refs[item.id]}
            />
          ))}
        </div>
      </div>
    </section>
  )
})

export default InsightsStudio
