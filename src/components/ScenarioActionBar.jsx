import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Trash2,
  BadgeCheck,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle2,
  Archive,
  Layers,
} from 'lucide-react'

/*
 * ScenarioActionBar
 * -----------------
 * Plan-lifecycle action bar + confirmation modal system.
 *
 * Stack note: this project ships plain JSX + Tailwind + lucide-react (no
 * TypeScript, no shadcn/ui). The DropdownMenu / Dialog / Button / Badge
 * primitives below are dependency-free and styled to the shadcn aesthetic so
 * the bar runs as-is and matches the rest of the app.
 *
 * Callback props:
 *   onFinalizePlan(planId)  — commit the chosen plan, archive the rest
 *   onPurgePlan(planId)     — delete a single plan (draft)
 *   onPurgeAll()            — delete every plan (high-friction)
 */

// ── Badge ────────────────────────────────────────────────────────────────
function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${tones[tone]}`}>
      {children}
    </span>
  )
}

// ── Button ───────────────────────────────────────────────────────────────
function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
    ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500',
  }
  const sizes = { md: 'px-3.5 py-2 text-sm', sm: 'px-2.5 py-1.5 text-[13px]' }
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ── DropdownMenu ───────────────────────────────────────────────────────────
function DropdownMenu({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger(open)}</div>
      {open && (
        <div
          className={`absolute z-40 mt-1.5 min-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 ${align === 'right' ? 'right-0' : 'left-0'}`}
          role="menu"
        >
          {/* close the menu after any interior selection */}
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon: Icon, label, sub, tone = 'default', onSelect }) {
  const tones = {
    default: 'text-slate-700 hover:bg-slate-50',
    danger: 'text-rose-600 hover:bg-rose-50',
  }
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition ${tones[tone]}`}
    >
      {Icon && <Icon className={`h-4 w-4 flex-shrink-0 ${tone === 'danger' ? 'text-rose-500' : 'text-slate-400'}`} />}
      <span className="min-w-0">
        <span className="block truncate font-semibold">{label}</span>
        {sub && <span className="block truncate text-[11px] font-normal text-slate-400">{sub}</span>}
      </span>
    </button>
  )
}

function MenuDivider() {
  return <div className="my-1 h-px bg-slate-100" />
}

// ── Dialog (modal) ─────────────────────────────────────────────────────────
function Dialog({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {children}
      </div>
    </div>,
    document.body,
  )
}

function DialogHeader({ icon: Icon, tone = 'indigo', title, onClose }) {
  const tones = {
    indigo: 'from-indigo-500 to-violet-500',
    emerald: 'from-emerald-500 to-teal-500',
    rose: 'from-rose-500 to-red-500',
  }
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tones[tone]} text-white shadow-sm`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-1 flex-1 text-base font-extrabold tracking-tight text-slate-900">{title}</h3>
      <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── The action bar ─────────────────────────────────────────────────────────
export default function ScenarioActionBar({ basePlan, scenarios = [], onFinalizePlan, onPurgePlan, onPurgeAll }) {
  // Unified plan list: base + each scenario.
  const plans = [
    { id: 'base', name: 'Base Plan', code: basePlan?.code || 'BASE', kind: 'base' },
    ...scenarios.map((s, i) => ({
      id: s.id,
      name: `Scenario ${i + 1}`,
      code: s.code,
      tagline: s.tagline || s.name,
      kind: 'scenario',
    })),
  ]
  const loadedCount = plans.length

  // Modal state: which flow is open, and the target plan.
  const [finalizeTarget, setFinalizeTarget] = useState(null) // plan object
  const [purgeTarget, setPurgeTarget] = useState(null) // plan object
  const [purgeAllOpen, setPurgeAllOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const closeAll = () => {
    setFinalizeTarget(null)
    setPurgeTarget(null)
    setPurgeAllOpen(false)
    setConfirmText('')
  }

  const handleFinalize = () => {
    onFinalizePlan?.(finalizeTarget.id)
    closeAll()
  }
  const handlePurge = () => {
    onPurgePlan?.(purgeTarget.id)
    closeAll()
  }
  const handlePurgeAll = () => {
    onPurgeAll?.()
    closeAll()
  }

  const planLabel = (p) => (p.tagline ? `${p.name} · ${p.tagline}` : p.name)
  const otherPlans = finalizeTarget ? plans.filter((p) => p.id !== finalizeTarget.id) : []

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {/* Left — status */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm">
          <Layers className="h-4 w-4" />
        </span>
        <div className="flex items-center gap-2">
          <Badge tone="indigo">{loadedCount} {loadedCount === 1 ? 'Plan' : 'Plans'} Loaded</Badge>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Draft — Read-only simulation
          </span>
        </div>
      </div>

      {/* Right — grouped actions */}
      <div className="flex items-center gap-2">
        {/* Purge dropdown */}
        <DropdownMenu
          trigger={(open) => (
            <Button variant="outline" size="md">
              <Trash2 className="h-4 w-4 text-rose-500" />
              Purge
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>
          )}
        >
          {plans.map((p) => (
            <MenuItem
              key={p.id}
              icon={Trash2}
              label={`Purge ${p.name}`}
              sub={p.tagline || p.code}
              onSelect={() => setPurgeTarget(p)}
            />
          ))}
          <MenuDivider />
          <MenuItem
            icon={AlertTriangle}
            label="Purge All Plans"
            sub="Deletes every draft — cannot be undone"
            tone="danger"
            onSelect={() => setPurgeAllOpen(true)}
          />
        </DropdownMenu>

        {/* Finalize dropdown */}
        <DropdownMenu
          trigger={(open) => (
            <Button variant="primary" size="md">
              <BadgeCheck className="h-4 w-4" />
              Finalize Plan
              <ChevronDown className={`h-4 w-4 text-indigo-200 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>
          )}
        >
          {plans.map((p) => (
            <MenuItem
              key={p.id}
              icon={p.kind === 'base' ? Archive : BadgeCheck}
              label={p.name}
              sub={p.tagline ? `${p.tagline} · ${p.code}` : p.code}
              onSelect={() => setFinalizeTarget(p)}
            />
          ))}
        </DropdownMenu>
      </div>

      {/* ── Finalize confirmation modal ─────────────────────────────── */}
      <Dialog open={!!finalizeTarget} onClose={closeAll}>
        {finalizeTarget && (
          <>
            <DialogHeader icon={BadgeCheck} tone="emerald" title={`Finalize ${finalizeTarget.name}?`} onClose={closeAll} />
            <div className="space-y-4 px-5 py-4">
              <p className="text-[13px] leading-relaxed text-slate-600">
                You are about to commit <span className="font-bold text-slate-900">{planLabel(finalizeTarget)}</span>
                {' '}(<span className="font-mono text-[12px] text-slate-500">{finalizeTarget.code}</span>) as the final allocation plan for this cycle.
              </p>
              <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> This action will
                </p>
                <ul className="space-y-1 text-[12px] text-slate-600">
                  <li className="flex items-start gap-1.5"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500" /> Commit and lock the selected plan for execution.</li>
                  <li className="flex items-start gap-1.5"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-slate-300" /> Archive the {otherPlans.length} other draft{otherPlans.length === 1 ? '' : 's'} ({otherPlans.map((p) => p.name).join(', ')}).</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <Button variant="ghost" onClick={closeAll}>Cancel</Button>
              <Button variant="primary" onClick={handleFinalize}>
                <BadgeCheck className="h-4 w-4" /> Commit &amp; Finalize
              </Button>
            </div>
          </>
        )}
      </Dialog>

      {/* ── Targeted purge modal ────────────────────────────────────── */}
      <Dialog open={!!purgeTarget} onClose={closeAll}>
        {purgeTarget && (
          <>
            <DialogHeader icon={Trash2} tone="rose" title={`Purge ${purgeTarget.name}?`} onClose={closeAll} />
            <div className="space-y-4 px-5 py-4">
              <p className="text-[13px] leading-relaxed text-slate-600">
                This will permanently delete <span className="font-bold text-slate-900">{planLabel(purgeTarget)}</span>
                {' '}(<span className="font-mono text-[12px] text-slate-500">{purgeTarget.code}</span>) from the simulation. This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <Button variant="ghost" onClick={closeAll}>Cancel</Button>
              <Button variant="danger" onClick={handlePurge}>
                <Trash2 className="h-4 w-4" /> Delete Plan
              </Button>
            </div>
          </>
        )}
      </Dialog>

      {/* ── High-friction Purge All modal ───────────────────────────── */}
      <Dialog open={purgeAllOpen} onClose={closeAll}>
        <DialogHeader icon={AlertTriangle} tone="rose" title="Purge All Plans?" onClose={closeAll} />
        <div className="space-y-4 px-5 py-4">
          <p className="text-[13px] leading-relaxed text-slate-600">
            This will permanently delete <span className="font-bold text-rose-600">all {loadedCount} plans</span> — the Base Plan and every scenario draft. This action is irreversible.
          </p>
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3">
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
              Type <span className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-rose-600 ring-1 ring-rose-200">PURGE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="PURGE"
              autoFocus
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tracking-wide text-slate-900 placeholder:text-slate-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
          <Button variant="ghost" onClick={closeAll}>Cancel</Button>
          <Button variant="danger" disabled={confirmText !== 'PURGE'} onClick={handlePurgeAll}>
            <Trash2 className="h-4 w-4" /> Delete All
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
