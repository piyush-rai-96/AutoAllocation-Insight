import { useState } from 'react'
import {
  Package,
  Factory,
  AlertTriangle,
  DollarSign,
  ArrowUp,
  TriangleAlert,
  LayoutDashboard,
  Warehouse,
} from 'lucide-react'
import { kpis } from '../data/mockData'
import Sparkline from './Sparkline'
import SectionHeader from './SectionHeader'

const iconMap = { Package, Factory, AlertTriangle, DollarSign, Warehouse }

const accentMap = {
  slate: {
    icon: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700',
    value: 'text-slate-900',
    spark: '#64748b',
    dot: 'bg-gradient-to-b from-slate-400 to-slate-500',
    pill: 'bg-slate-100 text-slate-600',
  },
  amber: {
    icon: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700',
    value: 'text-slate-900',
    spark: '#d97706',
    dot: 'bg-gradient-to-b from-amber-400 to-amber-500',
    pill: 'bg-amber-50 text-amber-700',
  },
  rose: {
    icon: 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600',
    value: 'text-slate-900',
    spark: '#e11d48',
    dot: 'bg-gradient-to-b from-rose-400 to-rose-500',
    pill: 'bg-rose-50 text-rose-600',
  },
  violet: {
    icon: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    value: 'text-slate-900',
    spark: '#2563eb',
    dot: 'bg-gradient-to-b from-blue-400 to-blue-500',
    pill: 'bg-blue-50 text-blue-600',
  },
  teal: {
    icon: 'bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600',
    value: 'text-slate-900',
    spark: '#0d9488',
    dot: 'bg-gradient-to-b from-teal-400 to-teal-500',
    pill: 'bg-teal-50 text-teal-600',
  },
  indigo: {
    icon: 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600',
    value: 'text-slate-900',
    spark: '#0284c7',
    dot: 'bg-gradient-to-b from-sky-400 to-sky-500',
    pill: 'bg-sky-50 text-sky-600',
  },
}

function KpiCard({ kpi }) {
  const [hover, setHover] = useState(false)
  const Icon = iconMap[kpi.icon]
  const accent = accentMap[kpi.accent]

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-premium ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-premium-lg"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${accent.dot}`} />
      {/* sheen on hover */}
      <span className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-2xl">
        <span className="absolute -left-1/3 top-0 h-full w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:animate-sheen group-hover:opacity-100" />
      </span>

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl shadow-inner ring-1 ring-slate-200/60 transition-transform duration-300 group-hover:scale-105 ${accent.icon}`}>
            <Icon className="h-4 w-4" />
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent" />
          </div>
          <h3 className="max-w-[7rem] text-[11px] font-semibold uppercase leading-tight tracking-wider text-slate-500">
            {kpi.title}
          </h3>
        </div>
        {kpi.delta && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${accent.pill}`}
          >
            {kpi.deltaDir === 'up' && <ArrowUp className="h-3 w-3" />}
            {kpi.delta}
          </span>
        )}
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-2">
        <span className={`text-[32px] font-bold leading-none tracking-tight tabular-nums ${accent.value}`}>
          {kpi.value}
        </span>
        <div className="mb-0.5 opacity-70">
          <Sparkline data={kpi.spark} stroke={accent.spark} fill={accent.spark} width={88} height={30} />
        </div>
      </div>

      <div className="relative mt-4 space-y-1 border-t border-slate-100 pt-3">
        {kpi.lines.map((line, i) => (
          <div key={i} className="flex items-baseline gap-1.5 text-xs">
            {line.label && <span className="font-semibold text-slate-600">{line.label}:</span>}
            <span className={line.warn ? 'font-semibold text-amber-600' : 'text-slate-500'}>
              {line.warn && '⚠️ '}
              {line.value}
            </span>
          </div>
        ))}
      </div>

      {/* Contextual hover overlays */}
      {hover && kpi.overlay && (
        <div className="absolute left-1/2 top-full z-40 mt-2 w-64 -translate-x-1/2 animate-floatUp rounded-2xl border border-slate-700/60 bg-slate-900/95 p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">
            {kpi.overlay.title || 'Volume Missing'}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {kpi.overlay.unmetUnits}
          </p>
          <p className="text-xs font-medium text-slate-400">{kpi.overlay.label}</p>
          <div className="mt-3 flex h-16 items-end gap-1">
            {[40, 62, 48, 80, 70, 95].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-rose-500/40 to-rose-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      )}
      {hover && kpi.warning && (
        <div className="absolute left-1/2 top-full z-40 mt-2 w-72 -translate-x-1/2 animate-floatUp rounded-2xl border border-slate-700/60 bg-slate-900/95 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur">
          <div className="flex gap-2">
            <TriangleAlert className="h-4 w-4 flex-shrink-0 text-amber-400" />
            <p className="text-xs font-medium leading-relaxed text-slate-200">{kpi.warning}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function KpiStrip() {
  return (
    <section>
      <SectionHeader icon={LayoutDashboard} title="Overview" subtitle="Core health at a glance" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  )
}
