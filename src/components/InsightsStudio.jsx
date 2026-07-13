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

const drawerIconMap = {
  minConstraints: ArrowUpNarrowWide,
  maxCapping: Lock,
  packConfig: Puzzle,
  dcInventory: AlertOctagon,
  sizeCurve: Ruler,
}

const drawerDotMap = {
  minConstraints: 'bg-sky-500',
  maxCapping: 'bg-slate-400',
  packConfig: 'bg-indigo-500',
  dcInventory: 'bg-rose-500',
  sizeCurve: 'bg-amber-500',
}

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

const toneMap = {
  sky: {
    header: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-600',
    border: 'border-slate-300',
    headerBg: 'bg-slate-50',
    chip: 'bg-slate-100',
    stripe: '',
  },
  slate: {
    header: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-600',
    border: 'border-slate-300',
    headerBg: 'bg-slate-50',
    chip: 'bg-slate-100',
    stripe: '',
  },
  rose: {
    header: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-600',
    border: 'border-slate-300',
    headerBg: 'bg-slate-50',
    chip: 'bg-slate-100',
    stripe: '',
  },
  amber: {
    header: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-600',
    border: 'border-slate-300',
    headerBg: 'bg-slate-50',
    chip: 'bg-slate-100',
    stripe: '',
  },
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

function StyleNode({ style, index, planId }) {
  const [open, setOpen] = useState(false)
  const combo = `${planId} / ${style.code} (${style.group})`
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
          {style.stores.map((s, i) => (
            <StoreRow
              key={i}
              store={s}
              index={i}
              planId={planId}
              styleCode={style.code}
              styleGroup={style.group}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PlanNode({ plan, defaultOpen, index }) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = getPlanMeta(plan.id)
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
          {plan.styles.map((style, i) => (
            <StyleNode key={i} style={style} index={i} planId={plan.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function PoTable({ rows }) {
  const push = useToast()
  const copyPo = (po) => {
    navigator.clipboard?.writeText(po).catch(() => {})
    push('PO copied. Paste into your procurement tool to expedite shipment.')
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Affected Style-Color</th>
            <th className="px-4 py-2.5 font-semibold">Network Status</th>
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
  )
}

function InsightDrawer({ item, open, onToggle, innerRef }) {
  const tone = toneMap[item.tone]
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
          {(() => {
            const DrawerIcon = drawerIconMap[item.id] || FolderTree
            return <DrawerIcon className="h-4 w-4" />
          })()}
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${drawerDotMap[item.id] || 'bg-slate-400'}`}
          />
        </span>
        <span className={`text-sm font-bold uppercase tracking-wide ${open ? tone.header : 'text-slate-700'}`}>
          {item.title}
        </span>
        {typeof item.planCount === 'number' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${drawerDotMap[item.id] || 'bg-slate-400'}`} />
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
              <PoTable rows={item.rows} />
            ) : (
              <div className="space-y-1 font-sans">
                {item.plans.map((plan, i) => (
                  <PlanNode key={plan.id} plan={plan} defaultOpen={i === 0} index={i} />
                ))}
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
