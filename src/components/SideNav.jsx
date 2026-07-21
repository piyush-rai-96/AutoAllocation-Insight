import { Boxes, LayoutDashboard, FlaskConical } from 'lucide-react'

// Screen registry — add new screens here and they show up in the rail.
export const SCREENS = [
  { key: 'insights', label: 'Insights', icon: LayoutDashboard },
  { key: 'whatif', label: 'What if Agent', icon: FlaskConical },
]

// Left navigation rail used to switch between top-level screens. Soft pastel
// glass so the whole frame reads airy and modern; active state uses a gentle
// lavender→sky gradient.
export default function SideNav({ view, onChange }) {
  return (
    <aside className="sticky top-0 z-40 flex h-screen w-16 flex-shrink-0 flex-col items-center gap-2 border-r border-white/70 bg-gradient-to-b from-white/85 via-indigo-50/70 to-sky-50/70 py-4 shadow-[1px_0_0_rgba(15,23,42,0.04),8px_0_28px_-22px_rgba(79,70,229,0.35)] backdrop-blur-xl sm:w-56 sm:items-stretch sm:px-3">
      {/* Brand */}
      <div className="mb-4 flex items-center gap-2.5 px-0 sm:px-1">
        <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 via-violet-400 to-sky-400 text-white shadow-lg ring-1 ring-white/40">
          <span className="pointer-events-none absolute -inset-2 bg-[conic-gradient(from_180deg,rgba(167,139,250,0.6),rgba(125,211,252,0.5),rgba(110,231,183,0.5),rgba(167,139,250,0.6))] opacity-70 blur-md aurora" />
          <Boxes className="relative h-5 w-5" />
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-extrabold tracking-tight text-slate-800">AutoAllocation</p>
          <p className="truncate text-[10px] font-medium tracking-wide text-slate-400">Insights Console</p>
        </div>
      </div>

      {/* Screen switcher */}
      <nav className="flex flex-1 flex-col gap-1.5">
        {SCREENS.map(({ key, label, icon: Icon }) => {
          const active = view === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-current={active ? 'page' : undefined}
              title={label}
              className={`group flex items-center justify-center gap-2.5 rounded-xl px-0 py-2.5 text-sm font-semibold transition sm:justify-start sm:px-3 ${
                active
                  ? 'bg-gradient-to-r from-indigo-400 to-sky-400 text-white shadow-sm ring-1 ring-white/40'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </nav>

      <p className="hidden px-2 text-[10px] leading-relaxed text-slate-400 sm:block">
        Baseline cycle snapshot · Read-only diagnostics
      </p>
    </aside>
  )
}
