import { useState } from 'react'
import { Sparkles, Download, TrendingDown, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'
import { playbook, buildInsightExport } from '../data/mockData'
import SectionHeader from './SectionHeader'
import { useToast } from './Toast'

const severityMap = {
  critical: {
    dot: 'bg-rose-500',
    label: 'Critical',
    labelChip: 'bg-rose-50 text-rose-600 border-rose-200',
    ring: 'border-slate-200/80',
    header: 'bg-gradient-to-r from-rose-50/60 to-slate-50 text-slate-700 border-slate-200',
    btn: 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700',
  },
  warning: {
    dot: 'bg-amber-500',
    label: 'Warning',
    labelChip: 'bg-amber-50 text-amber-600 border-amber-200',
    ring: 'border-slate-200/80',
    header: 'bg-gradient-to-r from-amber-50/50 to-slate-50 text-slate-700 border-slate-200',
    btn: 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700',
  },
}

const steps = [
  { key: 'what', label: 'What', num: '1' },
  { key: 'why', label: 'Why', num: '2' },
  { key: 'next', label: 'Next Step', num: '3' },
]

function PlaybookCard({ card, idx, open, onToggle }) {
  const push = useToast()
  const sev = severityMap[card.severity]

  const exportList = (e) => {
    e.stopPropagation()
    const lines = buildInsightExport(card.exportBucketId)
    if (lines.length === 0) {
      push('No list available to export for this item.')
      return
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {})
    push(`Exported ${card.title} list (${lines.length - 1} rows) to clipboard as CSV.`)
  }

  return (
    <article
      style={{ animationDelay: `${idx * 70}ms` }}
      className={`group/card flex animate-floatUp flex-col overflow-hidden rounded-2xl border bg-white shadow-premium ring-1 ring-white/50 transition-all duration-300 hover:shadow-premium-lg ${
        open ? sev.ring : 'border-slate-200/80 hover:-translate-y-0.5'
      }`}
    >
      {/* Header — always visible, click to toggle */}
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`flex items-center gap-2.5 border-b px-4 py-3.5 text-left transition-colors ${sev.header} ${open ? '' : 'border-transparent'}`}
      >
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${sev.dot} ${card.severity === 'critical' ? 'shadow-[0_0_8px_1px_rgba(244,63,94,0.5)]' : 'shadow-[0_0_8px_1px_rgba(245,158,11,0.5)]'}`} />
        <h3 className="flex-1 text-sm font-bold uppercase tracking-wide text-slate-700">
          <span className="mr-1.5 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
          {card.title}
        </h3>
        {card.lostSalesValue && (
          <span className="hidden rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-bold text-rose-700 shadow-sm ring-1 ring-rose-100 sm:inline-block">
            {card.lostSalesValue}
          </span>
        )}
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${sev.labelChip}`}
        >
          {sev.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsed preview — cozy one-liner */}
      {!open && (
        <button onClick={onToggle} className="px-4 py-3 text-left">
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">What: </span>
            {card.what}
          </p>
          <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition group-hover/card:text-slate-600">
            <ChevronDown className="h-3 w-3" />
            Expand for Why → Next Step & export
          </span>
        </button>
      )}

      {/* Expanded body — powerful full detail */}
      {open && (
        <>
          <div className="flex-1 animate-drawerIn space-y-3 p-4">
            {steps.map((step) => (
              <div key={step.key} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10">
                  {step.num}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{card[step.key]}</p>
                </div>
              </div>
            ))}

            {card.lostSales && (
              <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 flex-shrink-0 text-rose-500" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Lost Sales if Not Released
                  </p>
                  {card.lostSalesValue && (
                    <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-100">
                      {card.lostSalesValue}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{card.lostSales}</p>
              </div>
            )}
          </div>

          <footer className="border-t border-slate-100 p-4">
            <button
              onClick={exportList}
              className={`group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-premium ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 ${sev.btn}`}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              <Download className="h-4 w-4" />
              {card.trigger}
            </button>
          </footer>
        </>
      )}
    </article>
  )
}

export default function Playbook() {
  const criticalCount = playbook.filter((c) => c.severity === 'critical').length
  const warningCount = playbook.filter((c) => c.severity === 'warning').length

  // Default: all cards collapsed (cozy). Users expand what they want to dig into.
  const [openMap, setOpenMap] = useState(() =>
    Object.fromEntries(playbook.map((c) => [c.id, false])),
  )
  const allOpen = playbook.every((c) => openMap[c.id])
  const toggleCard = (id) => setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleAll = () =>
    setOpenMap(Object.fromEntries(playbook.map((c) => [c.id, !allOpen])))

  return (
    <section>
      <SectionHeader
        icon={Sparkles}
        title="Alan's Smart Actions Playbook"
        subtitle="What → Why → Next Step"
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium ring-1 ring-white/50">
        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 overflow-hidden border-b border-white/5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <span className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(600px_120px_at_10%_-40%,rgba(99,102,241,0.35),transparent),radial-gradient(500px_120px_at_90%_140%,rgba(14,165,233,0.25),transparent)]" />
          <div className="relative flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-wide">Recommended Action Report</p>
              <p className="text-[11px] text-slate-300">Prioritized allocation interventions for this cycle</p>
            </div>
          </div>
          <div className="relative ml-auto flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="text-lg font-bold tabular-nums">{playbook.length}</span>
              <span className="text-slate-300">Actions</span>
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
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/20"
            >
              {allOpen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        </div>
      <div className="grid grid-cols-1 items-start gap-4 p-5 lg:grid-cols-2">
        {playbook.map((card, idx) => (
          <PlaybookCard
            key={card.id}
            card={card}
            idx={idx}
            open={!!openMap[card.id]}
            onToggle={() => toggleCard(card.id)}
          />
        ))}
      </div>
      </div>
    </section>
  )
}
