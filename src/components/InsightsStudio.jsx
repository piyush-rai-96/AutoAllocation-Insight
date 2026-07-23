import { forwardRef, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
} from 'lucide-react'
import { insightCards, getPlanMeta, buildInsightExport } from '../data/mockData'
import Tooltip from './Tooltip'
import { useToast } from './Toast'
import SectionHeader from './SectionHeader'

// Each card's SHARE of the total flagged plan-hits this cycle. A plan can trip
// multiple checks, so raw coverage overlaps; expressing each card as a share of
// the summed plan-hits lets the badges add up to exactly 100%. Largest-remainder
// rounding guarantees the rounded shares still total 100.
const PLAN_SHARE = (() => {
  const counts = insightCards.map((c) => ({ id: c.id, count: c.planCount || 0 }))
  const total = counts.reduce((sum, c) => sum + c.count, 0)
  const map = {}
  if (!total) return map
  const parts = counts.map((c) => {
    const exact = (c.count / total) * 100
    const floor = Math.floor(exact)
    return { id: c.id, floor, remainder: exact - floor }
  })
  parts.forEach((p) => (map[p.id] = p.floor))
  let leftover = 100 - parts.reduce((sum, p) => sum + p.floor, 0)
  const byRemainder = [...parts].sort((a, b) => b.remainder - a.remainder)
  for (let i = 0; i < leftover; i++) map[byRemainder[i % byRemainder.length].id] += 1
  return map
})()

// Severity drives the card ring/dot + label chip. The icon itself still comes
// from the per-bucket iconName/tone registries below.
const severityMap = {
  critical: {
    rank: 0,
    dot: 'bg-rose-500',
    glow: 'shadow-[0_0_8px_1px_rgba(244,63,94,0.5)]',
    label: 'Critical',
    labelChip: 'bg-rose-50 text-rose-600 border-rose-200',
    ring: 'border-rose-200',
    rail: 'bg-gradient-to-b from-rose-400 to-rose-500',
    impact: 'text-rose-600',
  },
  warning: {
    rank: 1,
    dot: 'bg-amber-500',
    glow: 'shadow-[0_0_8px_1px_rgba(245,158,11,0.5)]',
    label: 'Warning',
    labelChip: 'bg-amber-50 text-amber-600 border-amber-200',
    ring: 'border-amber-200',
    rail: 'bg-gradient-to-b from-amber-400 to-amber-500',
    impact: 'text-amber-700',
  },
}

// Normalize impact/currency strings for display: drop trailing ".00" cents so
// figures read as clean money (e.g. "~$221.00 revenue at risk" → "~$221 …").
function formatImpact(value) {
  if (typeof value !== 'string') return value
  return value.replace(/(\$\d[\d,]*)\.00\b/g, '$1')
}

// What → Why → Next Step narrative (folded in from the old Playbook card).
const actionSteps = [
  { key: 'what', label: 'What', num: '1' },
  { key: 'why', label: 'Why', num: '2' },
  { key: 'next', label: 'Next Step', num: '3' },
]

// Render inline **bold** markers within a plain string.
function renderInlineBold(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <span key={i} className="font-bold text-slate-700">
          {part.slice(2, -2)}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )
}

// Icon + stat-color registries for the number-forward WHAT lens cards.
const lensIconByName = { warehouse: Warehouse, layers: Layers }
const lensStatTone = {
  rose: 'text-rose-600',
  amber: 'text-amber-600',
  violet: 'text-violet-600',
  slate: 'text-slate-700',
  emerald: 'text-emerald-600',
}

// WHAT — each lens as a metric-led card: headline numbers first, with the
// definition kept as a quiet footnote so the meaning is never lost.
function LensCards({ lenses }) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {lenses.map((lens, i) => {
        const LensIcon = lensIconByName[lens.icon] || Layers
        return (
          <div
            key={i}
            className="group rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm ring-1 ring-white/60 transition hover:border-slate-300 hover:shadow-premium"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                <LensIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[12px] font-bold text-slate-800">{lens.name}</span>
            </div>
            {/* Number-based summary */}
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
              {lens.stats?.map((s, si) => (
                <div key={si} className="leading-none">
                  <span className={`text-xl font-extrabold tabular-nums ${lensStatTone[s.tone] || 'text-slate-700'}`}>
                    {s.value}
                  </span>
                  <p className="mt-1 text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
            {lens.desc && (
              <p className="mt-2.5 border-t border-slate-100 pt-2 text-[10.5px] leading-relaxed text-slate-400">
                {lens.desc}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// NEXT STEP — render as numbered, actionable steps (professional checklist feel).
function ActionSteps({ points }) {
  return (
    <ol className="mt-2 space-y-1.5">
      {points.map((p, i) => (
        <li
          key={i}
          className="flex items-center gap-2.5 rounded-lg border border-slate-200/70 bg-white/70 px-2.5 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-white/50"
        >
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
            {i + 1}
          </span>
          <span className="leading-snug">{renderInlineBold(p)}</span>
        </li>
      ))}
    </ol>
  )
}

// WHY (default) — clean check-marked list, tighter than a paragraph block.
function WhyList({ points }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {points.map((p, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <span>{renderInlineBold(p)}</span>
        </li>
      ))}
    </ul>
  )
}

// A What/Why/Next value can be a plain string or a { text?, points[] } object.
// The layout is tailored per step so the block reads as a scannable brief.
function ActionContent({ value, stepKey }) {
  if (typeof value === 'string') {
    return <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{renderInlineBold(value)}</p>
  }
  const points = value.points || []
  return (
    <div className="mt-0.5">
      {(value.text || value.badge) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {value.text && <p className="text-sm leading-relaxed text-slate-600">{renderInlineBold(value.text)}</p>}
          {value.badge && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              <Store className="h-3 w-3 text-slate-400" />
              {value.badge}
            </span>
          )}
        </div>
      )}
      {stepKey === 'what' && value.lenses?.length > 0 && <LensCards lenses={value.lenses} />}
      {points.length > 0 &&
        (stepKey === 'next' ? <ActionSteps points={points} /> : <WhyList points={points} />)}
    </div>
  )
}

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
              <ActionContent value={item[step.key]} stepKey={step.key} />
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
  Urgent: { dot: 'bg-rose-400', bar: 'bg-rose-300' },
  Constrained: { dot: 'bg-amber-400', bar: 'bg-amber-300' },
  Safe: { dot: 'bg-emerald-400', bar: 'bg-emerald-300' },
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
      <span className="group/fwos relative inline-flex cursor-help items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/80 px-2.5 py-1 text-[10px] font-semibold text-rose-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-300 opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
        </span>
        <Timer className="relative h-3 w-3 opacity-60" />
        <span className="relative font-bold uppercase tracking-wide opacity-55">FWOS</span>
        <span className="relative tabular-nums">{label}</span>
        {!compact && stores ? (
          <span className="relative rounded-full bg-rose-100 px-1 font-bold tabular-nums text-rose-600">{stores}</span>
        ) : null}
      </span>
    </Tooltip>
  )
}

// A single polished "flag" chip used across every plan metric for a consistent, premium look.
function MetricChip({ icon: Icon, label, value, title, tone = 'slate' }) {
  const toneMap = {
    slate: 'border-slate-200/80 bg-slate-50 text-slate-600',
    rose: 'border-rose-100 bg-rose-50/80 text-rose-600',
    amber: 'border-amber-100 bg-amber-50/80 text-amber-700',
    emerald: 'border-emerald-100 bg-emerald-50/80 text-emerald-600',
    violet: 'border-sky-100 bg-sky-50/80 text-sky-700',
  }
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${toneMap[tone]}`}
    >
      {Icon && <Icon className="h-3 w-3 opacity-60" />}
      {label && <span className="font-bold uppercase tracking-wide opacity-55">{label}</span>}
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
      aria-label={typeof label === 'string' ? label : 'Export all'}
      className={`group/exp relative inline-flex flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 ${pad} font-bold text-white shadow-md shadow-indigo-400/25 ring-1 ring-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/exp:translate-x-full" />
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
      <Download className={`relative ${icon}`} />
      <span className="relative">{label}</span>
    </button>
  )
}

// Impact-cap indicator, shown at every level (plans / style-colors / stores)
// when a list is truncated. It is purely informational: it makes the top-N
// ranking unmistakable and points to the single "Export all" (on the drill-down
// header) for the complete, impact-ranked set — no duplicate export button.
function TruncationFooter({ shown, total, noun, indent = '' }) {
  if (total <= shown) return null
  const remaining = total - shown
  return (
    <div className={`mt-2 ${indent}`}>
      <div className="relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-blue-200/70 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-white px-3 py-2 shadow-sm ring-1 ring-white/60">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-sm ring-1 ring-white/40">
          <Layers className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
            <ArrowUpNarrowWide className="h-3 w-3 text-blue-500" />
            Showing top {shown} of {total} {noun} by impact
            <span className="rounded-full bg-blue-100 px-1.5 py-px text-[10px] font-extrabold text-blue-700">
              +{remaining} more
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">
            Highest-priority {noun} first — the full ranked set is one download away.
          </span>
        </span>
      </div>
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
  indigo: 'bg-blue-500',
  violet: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  cyan: 'bg-cyan-500',
  fuchsia: 'bg-sky-500',
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
      aria-label={label}
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover/node:opacity-100"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  )
}

// Per-plan copy menu — lets the user copy just this plan's ID, its list of
// affected style-colors, or its list of affected stores. Rendered through a
// portal so the dropdown is never clipped by the card's `overflow-hidden`.
function CopyMenu({ plan }) {
  const push = useToast()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onDismiss = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onDismiss, true)
    window.addEventListener('resize', onDismiss)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onDismiss, true)
      window.removeEventListener('resize', onDismiss)
    }
  }, [open])

  // Build the copy payloads once per render.
  const styles = plan.styles || []
  const styleList = styles.map((s) => `${s.code} (${s.group})`).join('\n')
  const seen = new Set()
  const stores = []
  styles.forEach((s) =>
    (s.stores || []).forEach((st) => {
      if (seen.has(st.id)) return
      seen.add(st.id)
      stores.push(`${st.id} ${st.name}`)
    }),
  )
  const storeList = stores.join('\n')

  const toggle = (e) => {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 232) })
    }
    setOpen((o) => !o)
  }

  const copy = (value, message) => (e) => {
    e.stopPropagation()
    if (!value) {
      push('Nothing to copy for this plan.')
      setOpen(false)
      return
    }
    navigator.clipboard?.writeText(value).catch(() => {})
    push(message)
    setOpen(false)
  }

  const items = [
    {
      icon: FolderTree,
      label: 'Plan ID',
      hint: plan.id,
      onClick: copy(plan.id, `Copied Plan ID: ${plan.id}`),
    },
    {
      icon: Layers,
      label: 'Style-Colors',
      hint: `${styles.length}`,
      onClick: copy(styleList, `Copied ${styles.length} style-color${styles.length === 1 ? '' : 's'} from ${plan.id}`),
    },
    {
      icon: Store,
      label: 'Stores',
      hint: `${stores.length}`,
      onClick: copy(storeList, `Copied ${stores.length} store${stores.length === 1 ? '' : 's'} from ${plan.id}`),
    },
  ]

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Copy from ${plan.id}`}
        aria-label={`Copy options for ${plan.id}`}
        className={`flex flex-shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-blue-300 ${
          open ? 'bg-slate-100 text-slate-600' : ''
        }`}
      >
        <Copy className="h-3.5 w-3.5" />
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 60 }}
            className="w-56 animate-drawerIn overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-premium-lg ring-1 ring-black/5"
          >
            <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Copy from {plan.id}
            </p>
            {items.map(({ icon: Icon, label, hint, onClick }) => (
              <button
                key={label}
                role="menuitem"
                onClick={onClick}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1">Copy {label}</span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                  {hint}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
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
        <CopyMenu plan={plan} />
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
          border: 'border-cyan-200',
          bg: 'from-cyan-50/70 to-white',
          icon: 'text-cyan-500',
          value: 'text-cyan-600',
          track: 'bg-cyan-100',
          fill: 'from-cyan-400 to-cyan-600',
          pill: 'bg-cyan-100 text-cyan-700',
          foot: 'text-cyan-600',
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
        { label: 'Fallback Units', value: `+${overview.fallbackUnits.toLocaleString()}`, tone: 'text-cyan-600' },
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
          <span className="text-[10px] font-bold tabular-nums text-cyan-600">
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
  // "Style-Color (Group)" formatting reused for both single-row and full-list copy.
  const styleLabel = (row) => `${row.style} (${row.group})`
  const copyStyle = (row) => {
    navigator.clipboard?.writeText(styleLabel(row)).catch(() => {})
    push(`Copied style-color: ${styleLabel(row)}`)
  }
  const copyStyleList = () => {
    const list = rows.map(styleLabel).join('\n')
    navigator.clipboard?.writeText(list).catch(() => {})
    push(`Copied ${rows.length} style-color${rows.length === 1 ? '' : 's'} to clipboard.`)
  }
  return (
    <div>
      <DcSourcingFlow dcFlow={dcFlow} />
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">
                <span className="inline-flex items-center gap-2">
                  Affected Style-Color
                  <button
                    onClick={copyStyleList}
                    title="Copy the full style-color list"
                    aria-label="Copy the full style-color list"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Copy className="h-3 w-3" />
                    Copy list
                  </button>
                </span>
              </th>
              <th className="px-4 py-2.5 font-semibold">Network Status</th>
              <th className="px-4 py-2.5 font-semibold">DC Sourcing</th>
              <th className="px-4 py-2.5 font-semibold">Target Dispatch PO to Expedite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="group/porow bg-white transition hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <span className="mr-1.5">{row.icon}</span>
                  <span className="font-mono font-semibold text-slate-700">{row.style}</span>
                  <span className="ml-1 text-xs text-slate-400">({row.group})</span>
                  <button
                    onClick={() => copyStyle(row)}
                    title="Copy this style-color"
                    aria-label={`Copy style-color ${styleLabel(row)}`}
                    className="ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md align-middle text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover/porow:opacity-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
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
                      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">
                        <ArrowRight className="h-3 w-3 opacity-70" />
                        Sourced from {row.sourcedFrom} · +{row.fallbackUnits}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    // A style-color may need one or several dispatch POs to fully
                    // expedite. Normalize both shapes to a list.
                    const pos = row.pos || [{ po: row.po, eta: row.eta, channel: row.channel }]
                    return (
                      <div className="flex flex-col gap-1.5">
                        {pos.length > 1 && (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                            {pos.length} POs to expedite
                          </span>
                        )}
                        {pos.map((p, pi) => (
                          <div key={pi} className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-700">{p.po}</span>
                            <button
                              onClick={() => copyPo(p.po)}
                              title="Copy PO number"
                              aria-label={`Copy PO number ${p.po}`}
                              className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs text-slate-400">
                              (ETA: {p.eta} / {p.channel})
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
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
  { key: 'onHand', label: 'On Hand', color: 'bg-gradient-to-b from-slate-200 to-slate-300', dot: 'bg-slate-300' },
  { key: 'onOrder', label: 'On Order', color: 'bg-gradient-to-b from-sky-300 to-sky-400', dot: 'bg-sky-400' },
  { key: 'inTransit', label: 'In Transit', color: 'bg-gradient-to-b from-blue-400 to-blue-500', dot: 'bg-blue-500' },
  { key: 'newAllocation', label: 'New Allocation', color: 'bg-gradient-to-b from-blue-600 to-blue-700', dot: 'bg-blue-600' },
]

// Store Velocity is read through a Forward-Weeks-of-Supply (FWOS) cover lens:
// more forward cover is safer, thin cover is stockout risk.
//   FWOS > 20  → Healthy      (ample forward cover)
//   FWOS 10–20 → Fine         (adequate cover, monitor)
//   FWOS < 10  → Needs Review (thin cover, stockout risk)
const FWOS_HEALTHY = 20
const FWOS_FINE_MIN = 10

// Classify a store's aggregate FWOS into a cover-health verdict.
// Retained for the (unchanged) Capacity Breach lens cross-reference chip.
function velocityStatus(fwos) {
  if (fwos > FWOS_HEALTHY)
    return { key: 'healthy', label: 'Healthy', sub: '>20 FWOS · ample cover', tone: 'emerald', flag: false }
  if (fwos >= FWOS_FINE_MIN)
    return { key: 'fine', label: 'Fine', sub: '10–20 FWOS · adequate cover', tone: 'sky', flag: false }
  return { key: 'review', label: 'Needs Review', sub: '<10 FWOS · thin cover', tone: 'amber', flag: true }
}

// ── Store Inventory Health ────────────────────────────────────────────────
// Every eligible replenishment Style Color is scored against its Target Weeks
// of Supply (TWOS):
//   Inventory < TWOS            → Under Target
//   TWOS ≤ Inventory ≤ 1.5×TWOS → Within Target (Healthy)
//   Inventory > 1.5×TWOS        → Over Target
// The store is then classified by the distribution across all its Style Colors:
//   ≥30% Under AND ≥30% Over → Imbalanced Inventory (mixed extremes)
//   ≥40% Under               → Broad Understock
//   ≥40% Over                → Broad Overstock
//   otherwise                → Balanced (not surfaced in this lens)
const INV_THRESH = { broad: 40, mixed: 30 }

const inventoryHealthMeta = {
  understock: {
    key: 'understock', label: 'Broad Understock', emoji: '🔴', tone: 'rose',
    chip: 'bg-rose-100 text-rose-700', border: 'border-rose-200 bg-rose-50/50',
    dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: 'text-rose-600 bg-rose-100',
  },
  overstock: {
    key: 'overstock', label: 'Broad Overstock', emoji: '🟠', tone: 'amber',
    chip: 'bg-amber-100 text-amber-700', border: 'border-amber-200 bg-amber-50/50',
    dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-600 bg-amber-100',
  },
  imbalanced: {
    key: 'imbalanced', label: 'Imbalanced Inventory', emoji: '🟣', tone: 'violet',
    chip: 'bg-violet-100 text-violet-700', border: 'border-violet-200 bg-violet-50/50',
    dot: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', icon: 'text-violet-600 bg-violet-100',
  },
}

// Compute the Style-Color distribution + classification for a store row.
// Returns null when the store has no evaluated Style Colors.
function inventoryHealth(row) {
  const inv = row.inv
  if (!inv || !inv.evaluated) return null
  const total = inv.evaluated
  const underPct = (inv.under / total) * 100
  const healthyPct = (inv.healthy / total) * 100
  const overPct = (inv.over / total) * 100
  let statusKey
  if (underPct >= INV_THRESH.mixed && overPct >= INV_THRESH.mixed) statusKey = 'imbalanced'
  else if (underPct >= INV_THRESH.broad) statusKey = 'understock'
  else if (overPct >= INV_THRESH.broad) statusKey = 'overstock'
  else statusKey = 'balanced'
  return {
    total,
    under: inv.under,
    healthy: inv.healthy,
    over: inv.over,
    underPct,
    healthyPct,
    overPct,
    statusKey,
    meta: inventoryHealthMeta[statusKey] || null,
    surfaced: statusKey !== 'balanced',
  }
}

// A store surfaces in the inventory lens only when it has a flagged pattern.
const isInventoryFlagged = (row) => inventoryHealth(row)?.surfaced === true

// Rank surfaced stores worst-first by the dominant deviation (max of under/over %).
function inventoryPriority(row) {
  const h = inventoryHealth(row)
  if (!h) return -1
  return Math.max(h.underPct, h.overPct)
}

// One-line AI Insight explaining why the store was flagged.
function inventoryInsight(h) {
  const u = Math.round(h.underPct)
  const o = Math.round(h.overPct)
  if (h.statusKey === 'understock')
    return `${u}% of replenishment Style Colors are below their Target Weeks of Supply, indicating a store-wide understocking pattern. Review replenishment quantities before dispatch.`
  if (h.statusKey === 'overstock')
    return `${o}% of replenishment Style Colors exceed 1.5× their Target Weeks of Supply, indicating a store-wide overstocking pattern. Reduce replenishment before dispatch to free floor space and capital.`
  if (h.statusKey === 'imbalanced')
    return `${u}% of Style Colors are understocked while ${o}% are overstocked — a mixed distribution. Rebalance allocation across the assortment before dispatch.`
  return ''
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

// Indicator 1 — Physical Space. Radial gauge + a refined monochrome-blue
// stacked inventory bar with a crisp capacity ceiling marker and a soft breach
// wash beyond it. The overage is folded into the Fill/Cap readout (the gauge %
// already communicates the breach), so there is no redundant "over" pill.
function PhysicalSpaceIndicator({ row, index, over, near, util }) {
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  const scale = Math.max(util, 100) // baseline so the 100% ceiling maps consistently
  const ceilingLeft = (row.capacity / scale) * 100
  const overflowUnits = Math.max(projected - row.capacity, 0)
  const headroomUnits = Math.max(row.capacity - projected, 0)
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-inner ring-1 ring-white/60">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${over ? 'bg-rose-500' : near ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          Physical Space
        </span>
      </div>
      <div className="flex items-center gap-4">
        <CapacityGauge util={util} over={over} near={near} />
        <div className="min-w-0 flex-1">
          {/* Stacked capacity bar. Fill maps against a scale where the capacity
              ceiling sits at a fixed mark; anything past it reads as breach. */}
          <div className="relative h-3 w-full rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70">
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
            {/* Soft breach wash beyond the ceiling — subtle, not hatched */}
            {over && (
              <span
                className="pointer-events-none absolute inset-y-0 rounded-r-full bg-rose-500/10"
                style={{ left: `${ceilingLeft}%`, right: 0 }}
              />
            )}
            {/* Crisp ceiling marker with a small cap */}
            <span
              className={`absolute -top-1.5 -bottom-1.5 w-px ${over ? 'bg-rose-500' : 'bg-slate-400'}`}
              style={{ left: `${ceilingLeft}%` }}
              title={`Capacity ceiling: ${row.capacity.toLocaleString()} units`}
            >
              <span className={`absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${over ? 'bg-rose-500' : 'bg-slate-400'}`} />
            </span>
          </div>
          {/* Fill / Cap readout with the overage folded in — no redundant pill */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span className="inline-flex items-baseline gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fill</span>
              <span className="font-bold tabular-nums text-slate-900">{projected.toLocaleString()}</span>
            </span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-baseline gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cap</span>
              <span className="font-bold tabular-nums text-slate-900">{row.capacity.toLocaleString()}</span>
            </span>
            <span className="text-slate-200">·</span>
            {over ? (
              <span className="font-bold text-rose-600">
                {overflowUnits.toLocaleString()} over ceiling
              </span>
            ) : (
              <span className="font-semibold text-emerald-600">
                {headroomUnits.toLocaleString()} headroom
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Inventory legend */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
        {capacitySegments.map((seg) => (
          <span
            key={seg.key}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-[10px] font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/70"
          >
            <span className={`h-2 w-2 rounded-full ${seg.dot}`} />
            {seg.label}
            <span className="font-bold tabular-nums text-slate-800">{row[seg.key].toLocaleString()}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Tone map retained for the (unchanged) Capacity Breach lens FWOS cross-ref chip.
const velocityToneMap = {
  amber: { text: 'text-amber-600', chip: 'bg-amber-100 text-amber-700', fill: 'bg-amber-500', border: 'border-amber-200 bg-amber-50/50' },
  sky: { text: 'text-sky-600', chip: 'bg-sky-100 text-sky-700', fill: 'bg-sky-500', border: 'border-sky-200 bg-sky-50/40' },
  emerald: { text: 'text-emerald-600', chip: 'bg-emerald-100 text-emerald-700', fill: 'bg-emerald-500', border: 'border-emerald-200 bg-emerald-50/40' },
}

// User-friendly inventory bands. The technical TWOS definition is kept as a
// quiet subtitle so the meaning is never lost, but the headline label is plain.
const invBands = [
  { key: 'under', label: 'Understocked', hint: 'Below target cover', bar: 'bg-gradient-to-r from-rose-400 to-rose-500', soft: 'bg-rose-50', ring: 'ring-rose-100', dot: 'bg-rose-500', num: 'text-rose-600' },
  { key: 'healthy', label: 'Healthy', hint: 'On target', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500', soft: 'bg-emerald-50', ring: 'ring-emerald-100', dot: 'bg-emerald-500', num: 'text-emerald-600' },
  { key: 'over', label: 'Overstocked', hint: 'Above target cover', bar: 'bg-gradient-to-r from-amber-400 to-amber-500', soft: 'bg-amber-50', ring: 'ring-amber-100', dot: 'bg-amber-500', num: 'text-amber-600' },
]

// Indicator 2 — Store Inventory Health. Distribution of eligible replenishment
// Style Colors across Understocked / Healthy / Overstocked bands vs. TWOS, the
// resulting store classification, and a one-line AI Insight.
function StoreInventoryHealthCard({ row }) {
  const h = inventoryHealth(row)
  if (!h) return null
  const M = h.meta
  const pct = { under: Math.round(h.underPct), healthy: Math.round(h.healthyPct), over: Math.round(h.overPct) }
  const count = { under: h.under, healthy: h.healthy, over: h.over }
  return (
    <div className={`overflow-hidden rounded-2xl border p-4 ${M ? M.border : 'border-slate-200 bg-slate-50/50'}`}>
      {/* Header — headline metric */}
      <div className="mb-3.5 flex items-end justify-between">
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inventory Health</span>
          <span className="mt-1 text-[10px] font-medium text-slate-400">Style Colors vs. Target Weeks of Supply</span>
        </div>
        <div className="text-right leading-none">
          <span className="text-2xl font-extrabold tabular-nums text-slate-800">{h.total.toLocaleString()}</span>
          <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Style Colors</span>
        </div>
      </div>

      {/* At-a-glance stacked distribution bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70">
        {invBands.map((b) => (
          <span
            key={b.key}
            className={`h-full ${b.bar} transition-all duration-500`}
            style={{ width: `${pct[b.key]}%` }}
            title={`${b.label}: ${count[b.key].toLocaleString()} (${pct[b.key]}%)`}
          />
        ))}
      </div>

      {/* Three-up stat grid with friendly names */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {invBands.map((b) => (
          <div key={b.key} className={`rounded-xl ${b.soft} p-2.5 ring-1 ${b.ring}`}>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
              <span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500">{b.label}</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className={`text-lg font-extrabold tabular-nums ${b.num}`}>{count[b.key].toLocaleString()}</span>
              <span className="text-[11px] font-bold text-slate-400">{pct[b.key]}%</span>
            </div>
            <span className="text-[9.5px] font-medium text-slate-400">{b.hint}</span>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-200/70 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
        {M && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${M.chip}`}>
            <span className="text-[10px]">{M.emoji}</span>
            {M.label}
          </span>
        )}
      </div>

      {/* AI Insight */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/70 p-2.5 ring-1 ring-slate-200/70">
        <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ${M ? M.icon : 'bg-slate-100 text-slate-500'}`}>
          <Sparkles className="h-3 w-3" />
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">AI Insight</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{inventoryInsight(h)}</p>
        </div>
      </div>
    </div>
  )
}

// "Store ID Name (Tier)" formatting reused for single-row and full-list copy.
const storeLabel = (row) => `${row.id} ${row.name} (${row.tier})`

// Shared store identifier header used by both drill-down views.
function StoreHeader({ row, iconTone, children }) {
  const push = useToast()
  const copyStore = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(storeLabel(row)).catch(() => {})
    push(`Copied store: ${storeLabel(row)}`)
  }
  return (
    <div className="group/store flex flex-wrap items-center gap-2">
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${iconTone}`}>
        <Store className="h-3.5 w-3.5" />
      </span>
      <span className="font-mono text-sm font-bold text-slate-800">{row.id}</span>
      <span className="text-xs text-slate-400">{row.name}</span>
      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
        {row.tier}
      </span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{row.plans}</span>
      <button
        onClick={copyStore}
        title="Copy this store"
        aria-label={`Copy store ${storeLabel(row)}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover/store:opacity-100"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      {children}
    </div>
  )
}

// View 1 row — Capacity Breach focus (physical space only).
function CapacityBreachRow({ row, index }) {
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  const util = (projected / row.capacity) * 100
  const over = util >= 100
  const near = util >= 90 && util < 100
  const vs = velocityStatus(row.storeWos)
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
    </div>
  )
}

// View 2 row — Store Inventory Health focus (Style-Color distribution vs. TWOS).
function StoreInventoryRow({ row, index }) {
  const h = inventoryHealth(row)
  if (!h) return null
  const M = h.meta
  const projected = row.onHand + row.onOrder + row.inTransit + row.newAllocation
  const over = projected / row.capacity >= 1
  return (
    <div
      className={`group/cap animate-nodeIn overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50/60 p-3.5 shadow-premium ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg ${
        M ? M.bg.split(' ')[1] || 'border-slate-200/80' : 'border-slate-200/80'
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <StoreHeader row={row} iconTone={M ? M.icon : 'bg-slate-100 text-slate-500'}>
        <span className="ml-auto flex items-center gap-1.5">
          {/* cross-reference capacity chip */}
          {over && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9.5px] font-bold text-rose-700">
              Over Capacity
            </span>
          )}
          {M && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${M.chip}`}>
              <span className="text-[10px]">{M.emoji}</span>
              {M.label}
            </span>
          )}
        </span>
      </StoreHeader>
      <div className="mt-3">
        <StoreInventoryHealthCard row={row} />
      </div>
    </div>
  )
}

// Physical breach % = total fill / capacity.
const capacityUtil = (r) => (r.onHand + r.onOrder + r.inTransit + r.newAllocation) / r.capacity

function CapacityTable({ rows }) {
  // Two independent lenses on the same stores, switchable via a segmented control.
  const [view, setView] = useState('capacity')
  // Inventory lens: optional status filter (understock / overstock / imbalanced).
  const [invFilter, setInvFilter] = useState(null)
  const push = useToast()

  const overPhysical = rows.filter((r) => capacityUtil(r) >= 1).length
  const nearPhysical = rows.filter((r) => capacityUtil(r) >= 0.9 && capacityUtil(r) < 1).length
  const withinPhysical = rows.length - overPhysical - nearPhysical

  // Inventory-health classification counts across the fleet.
  const invFlagged = rows.filter(isInventoryFlagged)
  const understock = invFlagged.filter((r) => inventoryHealth(r).statusKey === 'understock').length
  const overstock = invFlagged.filter((r) => inventoryHealth(r).statusKey === 'overstock').length
  const imbalanced = invFlagged.filter((r) => inventoryHealth(r).statusKey === 'imbalanced').length

  const views = [
    { key: 'capacity', label: 'Capacity Breach', icon: Warehouse, count: overPhysical },
    { key: 'inventory', label: 'Store Inventory Health', icon: Layers, count: invFlagged.length },
  ]

  const capacitySummary = [
    { label: 'Over Capacity', count: overPhysical, dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Near Capacity', count: nearPhysical, dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Within Limit', count: withinPhysical, dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  ]
  // Inventory buckets double as clickable filters (emoji + status label).
  const inventorySummary = [
    { key: 'understock', emoji: '🔴', label: 'Broad Understock', count: understock, dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    { key: 'overstock', emoji: '🟠', label: 'Broad Overstock', count: overstock, dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { key: 'imbalanced', emoji: '🟣', label: 'Imbalanced Inventory', count: imbalanced, dot: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  ]

  const isCapacity = view === 'capacity'
  const ranked = isCapacity
    ? [...rows].sort((a, b) => capacityUtil(b) - capacityUtil(a))
    : invFlagged
        .filter((r) => !invFilter || inventoryHealth(r).statusKey === invFilter)
        .sort((a, b) => inventoryPriority(b) - inventoryPriority(a))
  const visible = ranked.slice(0, MAX_STORES)

  const copyStoreList = () => {
    const list = ranked.map(storeLabel).join('\n')
    navigator.clipboard?.writeText(list).catch(() => {})
    push(`Copied ${ranked.length} store${ranked.length === 1 ? '' : 's'} to clipboard.`)
  }

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
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                active ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <VIcon className={`h-3.5 w-3.5 ${active ? 'text-blue-500' : 'text-slate-400'}`} />
              {v.label}
              <span className={`rounded-full px-1.5 py-px text-[9.5px] font-extrabold ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                {v.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Summary chips for the active lens */}
      <div className="flex flex-wrap items-center gap-2">
        {isCapacity
          ? capacitySummary.map((s) => (
              <span
                key={s.label}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {s.count} {s.label}
              </span>
            ))
          : inventorySummary.map((s) => {
              const active = invFilter === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setInvFilter(active ? null : s.key)}
                  title={`Filter to ${s.label} stores`}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${s.bg} ${s.text} ${
                    active ? 'ring-2 ring-offset-1 ring-slate-400' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <span className="text-[10px]">{s.emoji}</span>
                  {s.count} {s.label}
                </button>
              )
            })}
        {!isCapacity && invFilter && (
          <button
            onClick={() => setInvFilter(null)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 shadow-sm transition hover:bg-slate-50"
          >
            Clear filter
          </button>
        )}
        <button
          onClick={copyStoreList}
          title="Copy the full store list (in the current order)"
          aria-label="Copy the full store list"
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <Copy className="h-3 w-3" />
          Copy stores
        </button>
      </div>

      <div className="space-y-2.5">
        {visible.map((row, i) =>
          isCapacity ? (
            <CapacityBreachRow key={row.id} row={row} index={i} />
          ) : (
            <StoreInventoryRow key={row.id} row={row} index={i} />
          ),
        )}
      </div>
      <TruncationFooter shown={MAX_STORES} total={isCapacity ? rows.length : ranked.length} noun="stores" />
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
      className={`relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
        open ? `${sev.ring} shadow-premium-lg` : 'border-slate-200/80 shadow-premium ring-1 ring-white/50 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-premium-lg'
      }`}
    >
      {/* Severity rail — reinforces Critical vs Warning at a glance */}
      <span className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${sev.rail}`} />
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center gap-2.5 py-3.5 pl-5 pr-4 text-left transition ${open ? tone.headerBg : 'hover:bg-slate-50/70'}`}
      >
        <span
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 shadow-inner ring-1 ring-slate-200/60 transition-transform duration-300 ${tone.chip} ${open ? 'scale-105' : ''}`}
        >
          <DrawerIcon className="h-4 w-4" />
          {/* Small reinforcing marker; the rail + label chip carry severity, so
              this stays subtle (no glow) to avoid over-signaling. */}
          <span
            className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-white ${sev.dot}`}
          />
        </span>
        <span className={`text-sm font-bold tracking-tight ${open ? tone.header : 'text-slate-800'}`}>
          {item.title}
        </span>
        {typeof item.planCount === 'number' && (
          <span
            className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm sm:inline-flex"
            title={`${item.planCount} plans affected — ${PLAN_SHARE[item.id] ?? 0}% of all flagged plan-hits this cycle (shares total 100%)`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
            {PLAN_SHARE[item.id] ?? 0}% of Plans
          </span>
        )}
        {/* Right group — impact then severity, so the eye scans title → impact → severity */}
        <span className="ml-auto flex items-center gap-2">
          {item.lostSalesValue && (
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 px-2.5 py-0.5 text-[11px] font-semibold shadow-sm md:inline-flex">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Impact</span>
              <span className={sev.impact}>{formatImpact(item.lostSalesValue)}</span>
            </span>
          )}
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sev.labelChip}`}>
            {sev.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Collapsed preview — the What one-liner (from the old Playbook card) */}
      {!open && hasAction && item.what && (
        <button onClick={onToggle} className="w-full pb-3.5 pl-5 pr-4 text-left">
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">What: </span>
            {typeof item.what === 'string' ? item.what : item.what.text}
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
                    ? 'bg-gradient-to-br from-indigo-400 to-sky-400 text-white ring-white/40'
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
                className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${evidenceOpen ? 'rotate-90 text-blue-500' : 'text-slate-400'}`}
              />
            </button>
            <ExportAllButton
              onExport={exportBucket}
              size="sm"
              label={`Export all ${item.type === 'poTable' ? 'style-colors' : item.type === 'capacityTable' ? 'stores' : 'plans'}`}
              title={`${item.trigger || `Export ${item.title} list`} — exports ALL records (every plan, style-color & store), not just the top-ranked ones shown`}
            />
          </div>

          {evidenceOpen && (
            <div className="animate-drawerIn mt-2 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-3 shadow-inner">
              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-blue-500 shadow-sm ring-1 ring-slate-200">
                  <FolderTree className="h-3.5 w-3.5" />
                </span>
                {item.directoryTitle}
                {/* Scope indicator (not a button) — the single Export lives on the
                    'View affected plans & stores' row; this just clarifies scope. */}
                {isTree && totalPlans > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal shadow-sm ${
                      plansTruncated
                        ? 'border-blue-200/70 bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    <ArrowUpNarrowWide className={`h-3 w-3 ${plansTruncated ? 'text-blue-500' : 'text-slate-400'}`} />
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
                        onExport={exportBucket}
                      />
                    ))}
                  {plansTruncated && (
                    <div className="mt-2 border-t border-dashed border-slate-200 pt-2">
                      <TruncationFooter shown={MAX_PLANS} total={totalPlans} noun="plans" />
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

// Impact ranking for sort — pulls the leading dollar figure out of the impact
// string when present, else 0, so "Sort: Impact" orders by money at stake.
function impactValue(item) {
  const m = /\$\s*([\d,]+)/.exec(item.lostSalesValue || '')
  return m ? Number(m[1].replace(/,/g, '')) : 0
}

const SORTS = {
  severity: { label: 'Severity', fn: (a, b) => severityRank(a) - severityRank(b) || impactValue(b) - impactValue(a) },
  impact: { label: 'Impact', fn: (a, b) => impactValue(b) - impactValue(a) },
  plans: { label: 'Plans', fn: (a, b) => (b.planCount || 0) - (a.planCount || 0) },
}
const severityRank = (c) => (severityMap[c.severity]?.rank ?? 9)

const InsightsStudio = forwardRef(function InsightsStudio(
  { openMap, onToggle, onToggleAll, refs },
  ref,
) {
  const [sevFilter, setSevFilter] = useState('all') // 'all' | 'critical' | 'warning'
  const [sortKey, setSortKey] = useState('severity')

  const criticalCount = insightCards.filter((c) => c.severity === 'critical').length
  const warningCount = insightCards.filter((c) => c.severity === 'warning').length

  const visibleCards = insightCards
    .filter((c) => sevFilter === 'all' || c.severity === sevFilter)
    .slice()
    .sort(SORTS[sortKey].fn)

  const allOpen = visibleCards.length > 0 && visibleCards.every((c) => openMap[c.id])
  const toggleSev = (key) => setSevFilter((prev) => (prev === key ? 'all' : key))

  return (
    <section ref={ref} className="scroll-mt-24">
      <SectionHeader
        icon={Sparkles}
        title="Insights & Smart Actions"
        subtitle="What → Why → Next Step · evidence · export"
      />
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium-lg ring-1 ring-white/50">
        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 overflow-hidden border-b border-slate-200/70 bg-gradient-to-r from-indigo-50 via-sky-50 to-white px-5 py-4 text-slate-700">
          <span className="pointer-events-none absolute -inset-24 opacity-60 aurora [background-image:radial-gradient(600px_180px_at_10%_-40%,rgba(167,139,250,0.16),transparent),radial-gradient(520px_180px_at_92%_140%,rgba(125,211,252,0.14),transparent),radial-gradient(420px_160px_at_55%_-20%,rgba(110,231,183,0.12),transparent)]" />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <div className="relative flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-sky-400 text-white shadow-sm ring-1 ring-white/60">
              <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-400/40 to-sky-400/30 opacity-60 blur-md" />
              <Sparkles className="relative h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-wide text-slate-800">Diagnostic Insights & Recommended Actions</p>
              <p className="text-[11px] text-slate-500">
                One card per issue — action narrative up top, drill-down evidence one click away
              </p>
            </div>
          </div>
          <div className="relative ml-auto flex flex-wrap items-center gap-2 text-xs sm:gap-3">
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="text-lg font-bold tabular-nums text-slate-800">{insightCards.length}</span>
              <span className="text-slate-500">Insights</span>
            </span>
            <span className="hidden h-8 w-px bg-slate-200 sm:block" />
            {/* Clickable severity filters */}
            <button
              onClick={() => toggleSev('critical')}
              aria-pressed={sevFilter === 'critical'}
              title="Filter to Critical insights"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold transition ${
                sevFilter === 'critical' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : 'text-slate-600 hover:bg-white/70'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="tabular-nums">{criticalCount}</span>
              <span className="hidden text-slate-500 sm:inline">Critical</span>
            </button>
            <button
              onClick={() => toggleSev('warning')}
              aria-pressed={sevFilter === 'warning'}
              title="Filter to Warning insights"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold transition ${
                sevFilter === 'warning' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'text-slate-600 hover:bg-white/70'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="tabular-nums">{warningCount}</span>
              <span className="hidden text-slate-500 sm:inline">Warning</span>
            </button>
            <span className="h-8 w-px bg-slate-200" />
            {/* Sort control */}
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2 py-1 font-semibold text-slate-600 shadow-sm">
              <ArrowUpNarrowWide className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden text-slate-500 sm:inline">Sort</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="cursor-pointer bg-transparent text-slate-700 outline-none [&>option]:text-slate-800"
                title="Sort insights"
              >
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => onToggleAll(!allOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-500 to-sky-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30"
            >
              {allOpen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{allOpen ? 'Collapse all' : 'Expand all'}</span>
            </button>
          </div>
        </div>
        {/* Active-filter strip */}
        {sevFilter !== 'all' && (
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-2 text-[11px] text-slate-500">
            <span className="font-semibold">
              Showing {visibleCards.length} {sevFilter} {visibleCards.length === 1 ? 'insight' : 'insights'}
            </span>
            <button
              onClick={() => setSevFilter('all')}
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Clear filter
            </button>
          </div>
        )}
        <div className="space-y-3 p-5">
          {visibleCards.map((item) => (
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
