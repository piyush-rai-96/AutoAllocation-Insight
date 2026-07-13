import { Layers, ShieldCheck, AlertTriangle, Copy, ListFilter, Info } from 'lucide-react'
import { triage, worklist } from '../data/mockData'
import { useToast } from './Toast'
import SectionHeader from './SectionHeader'
import Tooltip from './Tooltip'

// Diagnostic checks run against every plan in the cycle.
const diagnosticChecks = [
  { label: 'Min Constraints Influencing Allocation', hint: 'Minimum floors forcing over-allocation above demand' },
  { label: 'Max Capping Allocation', hint: 'Store-level caps throttling allocation below demand' },
  { label: 'Pack Config → Under / Over Allocation', hint: 'Pack-size rounding dropping or over-shipping units' },
  { label: 'DC Inventory Constrained', hint: 'DC inventory below threshold or exhausted' },
  { label: 'Size Curve Deviation', hint: 'Shipped size profile vs. baseline demand' },
]

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
    theme: {
      base: 'border-slate-200 bg-white',
      active: 'border-slate-400 bg-slate-50 ring-1 ring-slate-200',
      count: 'text-slate-900',
      icon: 'text-slate-600 bg-slate-100',
      dot: 'bg-slate-400',
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
    subtext: `Screened across ${diagnosticChecks.length} diagnostic checks`,
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
            className={`group relative flex flex-col rounded-2xl border bg-gradient-to-b from-white to-slate-50/60 px-4 py-3.5 text-left shadow-sm ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg ${
              isActive ? card.theme.active : card.theme.base
            }`}
          >
            <span className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${card.theme.dot}`} />
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
                  <Tooltip
                    width="w-72"
                    placement="bottom"
                    content={
                      <span className="block">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-300">
                          Diagnostic checks run this cycle
                        </span>
                        {diagnosticChecks.map((c) => (
                          <span key={c.label} className="flex items-start gap-2 py-0.5">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                            <span className="leading-snug">
                              <span className="font-semibold text-slate-100">{c.label}</span>
                              <span className="block text-[11px] font-normal text-slate-400">{c.hint}</span>
                            </span>
                          </span>
                        ))}
                      </span>
                    }
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => e.stopPropagation()}
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
              <span className="text-[11px] text-slate-500">{card.subtext}</span>
            </div>
          </button>
        )
      })}
      </div>
    </section>
  )
}
