import { ShieldCheck } from 'lucide-react'
import { validationChecks } from '../data/mockData'
import SectionHeader from './SectionHeader'

const statusMap = {
  critical: { dot: 'bg-rose-500', badge: 'bg-slate-100 text-slate-600', label: 'FLAGGED' },
  warning: { dot: 'bg-amber-500', badge: 'bg-slate-100 text-slate-600', label: 'FLAGGED' },
  clear: { dot: 'bg-emerald-500', badge: 'bg-slate-100 text-slate-600', label: 'CLEAR' },
}

const severityMap = {
  CRITICAL: 'text-slate-800',
  MEDIUM: 'text-slate-600',
  NONE: 'text-slate-400',
}

export default function ValidationChecks() {
  return (
    <section>
      <SectionHeader
        icon={ShieldCheck}
        title="System Validation & Quality Checks"
        subtitle="Guardrails, priority inversions & concentration checks"
      />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-slate-400">
            <tr className="border-b border-slate-100">
              <th className="px-3 py-2 font-semibold">System Validation Check</th>
              <th className="px-3 py-2 font-semibold">Evaluation Status</th>
              <th className="px-3 py-2 font-semibold">Severity Rating</th>
              <th className="px-3 py-2 font-semibold">Detailed Log Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {validationChecks.map((row) => {
              const s = statusMap[row.statusTone]
              return (
                <tr key={row.check} className="transition hover:bg-slate-50/60">
                  <td className="px-3 py-3 font-semibold text-slate-700">{row.check}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${s.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-sm font-bold ${severityMap[row.severity]}`}>
                    {row.severity}
                    {row.severityCount > 0 && ` (${row.severityCount})`}
                  </td>
                  <td className="px-3 py-3 text-slate-500">{row.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
