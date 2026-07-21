export default function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <div className="group relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-premium ring-1 ring-white/10">
        <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-sky-500/20 to-transparent opacity-60 blur-md" />
        <Icon className="relative h-4 w-4" />
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
      </div>
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-800">{title}</h2>
      {subtitle && <span className="text-xs font-medium text-slate-400">{subtitle}</span>}
      <div className="ml-3 h-px flex-1 bg-gradient-to-r from-slate-300/70 via-slate-200/50 to-transparent" />
    </div>
  )
}
