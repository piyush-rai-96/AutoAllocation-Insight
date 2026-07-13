import { useMemo, useRef, useState } from 'react'
import { Globe, Boxes } from 'lucide-react'
import { ToastProvider } from './components/Toast'
import TriageRibbon from './components/TriageRibbon'
import KpiStrip from './components/KpiStrip'
import Playbook from './components/Playbook'
import InsightsStudio from './components/InsightsStudio'
import { insights } from './data/mockData'

function Workspace() {
  const [filter, setFilter] = useState('all')
  const [openInsights, setOpenInsights] = useState({})

  const insightsSectionRef = useRef(null)
  const insightRefs = useMemo(() => {
    const map = {}
    insights.forEach((i) => (map[i.id] = { current: null }))
    return map
  }, [])

  const toggleInsight = (id) =>
    setOpenInsights((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleFilter = (key) => {
    setFilter((prev) => (prev === key ? 'all' : key))
    setTimeout(() => {
      insightsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <div className="min-h-screen">
      {/* App bar */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.25)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white shadow-premium ring-1 ring-white/10">
              <Boxes className="h-5 w-5" />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                AutoAllocation Insights
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">Visual Diagnostic &amp; Triage Console</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-premium ring-1 ring-white/40 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Globe className="h-4 w-4 text-slate-500" />
            Global Aggregate View
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 sm:px-6">
        <TriageRibbon activeFilter={filter} onFilter={handleFilter} />

        <KpiStrip />

        <Playbook />

        <InsightsStudio
          ref={insightsSectionRef}
          openMap={openInsights}
          onToggle={toggleInsight}
          refs={insightRefs}
        />

        <footer className="pb-6 pt-2 text-center text-xs text-slate-400">
          AutoAllocation Insights · Baseline cycle snapshot · Read-only diagnostics
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Workspace />
    </ToastProvider>
  )
}
