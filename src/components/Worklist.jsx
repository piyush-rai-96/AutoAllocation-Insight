import { forwardRef, useMemo } from 'react'
import { Table2, Filter, X, AlertTriangle, ShieldCheck, TrendingDown, Boxes, Download } from 'lucide-react'
import { getWorklistSummary } from '../data/mockData'
import SectionHeader from './SectionHeader'
import { useToast } from './Toast'

const statusMap = {
  Constrained: { dot: 'bg-amber-500', badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' },
  Urgent: { dot: 'bg-rose-500', badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-500' },
  Safe: { dot: 'bg-emerald-500', badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-300' },
}

const filterLabels = {
  all: 'All Plans',
  safe: 'Safe Plans',
  issues: 'Plans with Issues',
  urgent: 'Urgent Actions',
}

function SummaryTile({ icon: Icon, label, value, sub, dot }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
          {label}
        </p>
        <p className="text-lg font-bold tabular-nums text-slate-900">{value}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

function RiskedRow({ plan }) {
  const s = statusMap[plan.status]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50/60">
      <span className="w-20 font-mono text-sm font-bold text-slate-800">{plan.id}</span>
      <span className="w-16 text-xs text-slate-500">{plan.styles}</span>
      <span className="w-28 text-xs text-slate-500">{plan.channels}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${plan.rate}%` }} />
        </div>
        <span className="text-xs font-semibold tabular-nums text-slate-600">{plan.rate.toFixed(1)}%</span>
      </div>
      <span className="ml-auto w-24 text-right text-xs tabular-nums text-slate-500">{plan.unmet}</span>
      <span className="w-20 text-right text-sm font-semibold tabular-nums text-slate-800">{plan.revenue}</span>
      <span className={`inline-flex w-28 items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${s.badge}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {plan.status}
      </span>
    </div>
  )
}

const Worklist = forwardRef(function Worklist({ filter, onClearFilter, approvedIds }, ref) {
  const push = useToast()

  const summary = useMemo(() => getWorklistSummary(approvedIds), [approvedIds])
  const { risked, safe, urgent, constrained, riskedCount, safeCount, totalUnmet, totalRevenue } = summary

  const showRisked = filter === 'all' || filter === 'issues' || filter === 'urgent'
  const showSafe = filter === 'all' || filter === 'safe'

  const riskedRows = useMemo(
    () => [...risked].sort((a, b) => a.rate - b.rate),
    [risked],
  )

  const exportPlans = (plans, label) => {
    if (plans.length === 0) {
      push(`No ${label} plans to export.`)
      return
    }
    const header = 'Plan,Styles,Channels,Allocation Rate,Unmet Volume,Revenue at Risk,Status'
    const lines = plans.map(
      (p) => `${p.id},${p.styles},${p.channels},${p.rate.toFixed(1)}%,${p.unmet},${p.revenue},${p.status}`,
    )
    navigator.clipboard?.writeText([header, ...lines].join('\n')).catch(() => {})
    push(`Exported ${plans.length} ${label} plans to clipboard (CSV).`)
  }

  return (
    <section ref={ref}>
      <SectionHeader
        icon={Table2}
        title="Master Plan Worklist"
        subtitle="High-level allocation risk summary"
      />

      {filter !== 'all' && (
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Filter className="h-3 w-3" />
            {filterLabels[filter]}
            <button onClick={onClearFilter} className="text-slate-400 hover:text-slate-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={AlertTriangle}
          label="Risked Plans"
          value={riskedCount}
          sub={`${urgent.length} Urgent · ${constrained.length} Constrained`}
          dot="bg-rose-500"
        />
        <SummaryTile
          icon={ShieldCheck}
          label="Safe Plans"
          value={safeCount}
          sub="100% allocated"
          dot="bg-emerald-500"
        />
        <SummaryTile
          icon={Boxes}
          label="Total Unmet Volume"
          value={totalUnmet.toLocaleString()}
          sub="units across risked plans"
        />
        <SummaryTile
          icon={TrendingDown}
          label="Total Revenue at Risk"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="if risked plans dispatch unresolved"
        />
      </div>

      <div className="space-y-4">
        {showRisked && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Risked Plans</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm">
                {riskedCount}
              </span>
              <button
                onClick={() => exportPlans(risked, 'risked')}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
            {riskedRows.length > 0 ? (
              <div>
                {riskedRows.map((plan) => (
                  <RiskedRow key={plan.id} plan={plan} />
                ))}
              </div>
            ) : (
              <p className="px-4 py-10 text-center text-sm text-slate-400">No risked plans remaining.</p>
            )}
          </div>
        )}

        {showSafe && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-700">
                {safeCount} Safe {safeCount === 1 ? 'Plan' : 'Plans'} · 100% allocated
              </p>
              <p className="text-xs text-slate-500">
                {safe.map((p) => p.id).join(', ') || 'None remaining'} — no action required.
              </p>
            </div>
            <button
              onClick={() => exportPlans(safe, 'safe')}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export Safe Plans
            </button>
          </div>
        )}
      </div>
    </section>
  )
})

export default Worklist
