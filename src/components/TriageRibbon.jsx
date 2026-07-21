import { Layers, ShieldCheck, AlertTriangle, Copy, ListFilter, Info, Tag, Store } from 'lucide-react'
import { triage, worklist, insights } from '../data/mockData'
import { useToast } from './Toast'
import SectionHeader from './SectionHeader'
import Tooltip from './Tooltip'

// Short, human labels and bar colors for the diagnostic breakdown popover,
// keyed by insight bucket id. Built from the live `insights` dataset so the
// counts and percentages stay in sync with the drill-down below.
const bucketMeta = {
  packConfig: { label: 'Pack Config Rounding', bar: 'bg-blue-500' },
  dcInventory: { label: 'DC Sourcing & Depletion', bar: 'bg-rose-500' },
  minConstraints: { label: 'Min Constraint Floors', bar: 'bg-sky-500' },
  storeCapacity: { label: 'Store Capacity Limits', bar: 'bg-teal-500' },
  maxCapping: { label: 'Max Ceiling Caps', bar: 'bg-slate-400' },
  sizeCurve: { label: 'Size Curve Deviation', bar: 'bg-amber-500' },
}

// Total flagged plans is the denominator for every bucket's share. Plans can
// trip more than one check, so the shares intentionally sum to > 100%.
const totalFlagged = triage.issues.count
const issueBreakdown = insights
  .map((b) => ({
    id: b.id,
    label: bucketMeta[b.id]?.label || b.title,
    bar: bucketMeta[b.id]?.bar || 'bg-slate-400',
    count: b.planCount || 0,
    pct: Math.round(((b.planCount || 0) / totalFlagged) * 100),
  }))
  .sort((a, b) => b.count - a.count)

// Premium popover: per-bucket share of flagged plans with mini impact bars.
const DiagnosticBreakdown = (
  <span className="block">
    <span className="mb-2 flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-200">
        Diagnostic Issue Breakdown
      </span>
      <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
        {totalFlagged} Flagged
      </span>
    </span>
    {issueBreakdown.map((b) => (
      <span key={b.id} className="mb-1.5 block last:mb-0">
        <span className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-slate-100">{b.label}</span>
          <span className="flex-shrink-0 tabular-nums">
            <span className="font-bold text-white">{b.pct}%</span>
            <span className="ml-1 font-normal text-slate-400">
              ({b.count} of {totalFlagged})
            </span>
          </span>
        </span>
        <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <span className={`block h-full rounded-full ${b.bar}`} style={{ width: `${b.pct}%` }} />
        </span>
      </span>
    ))}
    <span className="mt-2 block text-[10px] font-normal leading-snug text-slate-400">
      A plan can trip multiple checks, so shares may exceed 100%.
    </span>
  </span>
)

const planIdsByFilter = {
  all: worklist.map((p) => p.id),
  safe: worklist.filter((p) => p.status === 'Safe').map((p) => p.id),
  issues: worklist.filter((p) => p.status !== 'Safe').map((p) => p.id),
}

const cards = [
  {
    key: 'all',
    icon: Layers,
    emoji: '🌐',
    title: 'Total Plans',
    count: triage.allCycles.count,
    metric: triage.allCycles.label,
    subtext: triage.allCycles.subtext,
    styleColors: triage.allCycles.styleColors,
    stores: triage.allCycles.stores,
    scopeLabel: triage.allCycles.scopeLabel,
    theme: {
      base: 'border-slate-200 bg-white',
      active: 'border-blue-300 bg-blue-50/40 ring-1 ring-blue-200',
      count: 'text-slate-900',
      icon: 'text-blue-600 bg-blue-100',
      dot: 'bg-gradient-to-b from-blue-400 to-blue-600',
    },
  },
  {
    key: 'safe',
    icon: ShieldCheck,
    emoji: '✅',
    title: 'No Issues / Safe',
    count: triage.safe.simulated,
    metric: 'Safe Plans',
    subtext: triage.safe.subtext,
    styleColors: triage.safe.styleColors,
    stores: triage.safe.stores,
    scopeLabel: triage.safe.scopeLabel,
    theme: {
      base: 'border-slate-200 bg-white',
      active: 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200',
      count: 'text-slate-900',
      icon: 'text-slate-600 bg-slate-100',
      dot: 'bg-emerald-500',
    },
  },
  {
    key: 'issues',
    icon: AlertTriangle,
    emoji: '⚠️',
    title: 'Plans with Issues',
    count: triage.issues.count,
    metric: 'Plans',
    subtext: `Screened across ${insights.length} diagnostic checks`,
    styleColors: triage.issues.styleColors,
    stores: triage.issues.stores,
    scopeLabel: triage.issues.scopeLabel,
    showChecks: true,
    theme: {
      base: 'border-slate-200 bg-white',
      active: 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-200',
      count: 'text-slate-900',
      icon: 'text-slate-600 bg-slate-100',
      dot: 'bg-amber-500',
    },
  },
]

export default function TriageRibbon({ activeFilter, onFilter }) {
  const push = useToast()

  const copyPlanIds = (card) => {
    const ids = planIdsByFilter[card.key] || []
    if (ids.length === 0) {
      push(`No plan IDs to copy for ${card.title}.`)
      return
    }
    navigator.clipboard?.writeText(ids.join(', ')).catch(() => {})
    push(`Copied ${ids.length} ${card.title} IDs to clipboard: ${ids.join(', ')}`)
  }

  return (
    <section>
      <SectionHeader icon={ListFilter} title="Workflow Triage" subtitle="Cycle status at a glance" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = activeFilter === card.key
        return (
          <button
            key={card.key}
            onClick={() => copyPlanIds(card)}
            title="Click to copy plan IDs"
            className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50/70 px-4 py-3.5 text-left shadow-premium ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-premium-lg ${
              isActive ? card.theme.active : card.theme.base
            }`}
          >
            {/* sheen on hover */}
            <span className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-2xl">
              <span className="absolute -left-1/3 top-0 h-full w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:animate-sheen group-hover:opacity-100" />
            </span>
            <span className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${card.theme.dot}`} />
            <span className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl blur-sm transition-opacity duration-300 ${card.theme.dot} ${isActive ? 'opacity-80' : 'opacity-0 group-hover:opacity-50'}`} />
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-inner ${card.theme.icon}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-2xl font-extrabold tracking-tight tabular-nums ${card.theme.count}`}>
                {card.count}
              </span>
              <span className="text-sm font-semibold text-slate-500">{card.metric}</span>
              <span className="ml-auto flex items-center gap-1.5">
                {card.showChecks && (
                  <Tooltip width="w-80" placement="bottom" content={DiagnosticBreakdown}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => e.stopPropagation()}
                      title="View diagnostic issue breakdown"
                      className="flex items-center rounded-full p-0.5 text-amber-500 transition hover:text-amber-600"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </span>
                  </Tooltip>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    onFilter(card.key)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation()
                      onFilter(card.key)
                    }
                  }}
                  className="rounded p-1 text-slate-400 transition hover:bg-white/70 hover:text-slate-600"
                  title="Jump to diagnostics"
                >
                  {card.emoji}
                </span>
                <Copy className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-500" />
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {card.title}
              </span>
              <span className="text-[11px] text-slate-300">·</span>
              <span className="truncate text-[11px] text-slate-500">{card.subtext}</span>
            </div>
            {/* Impacted scope — Style-Colors & Stores, shown on every card */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-sm">
                <Tag className="h-3 w-3 text-slate-400" />
                <span className="font-bold tabular-nums text-slate-800">{card.styleColors}</span>
                Style-Colors
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-sm">
                <Store className="h-3 w-3 text-slate-400" />
                <span className="font-bold tabular-nums text-slate-800">{card.stores}</span>
                Stores
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                {card.scopeLabel}
              </span>
            </div>
          </button>
        )
      })}
      </div>
    </section>
  )
}
