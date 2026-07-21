import { useMemo, useRef, useState } from 'react'
import { Globe, Boxes } from 'lucide-react'
import { ToastProvider } from './components/Toast'
import TriageRibbon from './components/TriageRibbon'
import KpiStrip from './components/KpiStrip'
import InsightsStudio from './components/InsightsStudio'
import SideNav from './components/SideNav'
import WhatIfAgent from './components/WhatIfAgent'
import { insights } from './data/mockData'

function Workspace() {
  const [view, setView] = useState('insights') // 'insights' | 'whatif'
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

  const toggleAllInsights = (open) =>
    setOpenInsights(Object.fromEntries(insights.map((i) => [i.id, open])))

  const handleFilter = (key) => {
    setFilter((prev) => (prev === key ? 'all' : key))
    setTimeout(() => {
      insightsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <div className="flex min-h-screen">
      <SideNav view={view} onChange={setView} />
      <div className="min-w-0 flex-1">
        {view === 'whatif' ? (
          <WhatIfAgent />
        ) : (
    <div className="min-h-screen">
      {/* App bar */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/65 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_-18px_rgba(15,23,42,0.3)] backdrop-blur-xl">
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-400 to-sky-400 text-white shadow-premium ring-1 ring-white/40">
              <span className="pointer-events-none absolute -inset-2 bg-[conic-gradient(from_180deg,rgba(167,139,250,0.6),rgba(125,211,252,0.5),rgba(110,231,183,0.5),rgba(167,139,250,0.6))] opacity-70 blur-md aurora" />
              <Boxes className="relative h-5 w-5" />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                AutoAllocation Insights
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">Visual Diagnostic &amp; Triage Console</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-premium ring-1 ring-white/40 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_1px_rgba(16,185,129,0.6)]" />
            </span>
            <Globe className="h-4 w-4 text-slate-500" />
            Global Aggregate View
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-7 sm:px-6">
        <div className="animate-floatUp" style={{ animationDelay: '40ms' }}>
          <TriageRibbon activeFilter={filter} onFilter={handleFilter} />
        </div>

        <div className="animate-floatUp" style={{ animationDelay: '120ms' }}>
          <KpiStrip />
        </div>

        <div className="animate-floatUp" style={{ animationDelay: '200ms' }}>
          <InsightsStudio
            ref={insightsSectionRef}
            openMap={openInsights}
            onToggle={toggleInsight}
            onToggleAll={toggleAllInsights}
            refs={insightRefs}
          />
        </div>

        <footer className="pb-6 pt-2 text-center text-xs text-slate-400">
          AutoAllocation Insights · Baseline cycle snapshot · Read-only diagnostics
        </footer>
      </main>
    </div>
        )}
      </div>
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
