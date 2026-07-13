import { useState } from 'react'

export default function Tooltip({ content, children, width = 'w-64', placement = 'top' }) {
  const [open, setOpen] = useState(false)
  const isBottom = placement === 'bottom'
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && content && (
        <span
          className={`absolute left-1/2 z-50 -translate-x-1/2 ${width} animate-fadeIn rounded-xl border border-slate-700/60 bg-slate-900/95 px-3.5 py-3 text-left text-xs font-medium leading-relaxed text-slate-100 shadow-2xl ring-1 ring-black/5 backdrop-blur ${
            isBottom ? 'top-full mt-2' : 'bottom-full mb-2'
          }`}
        >
          {content}
          <span
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
              isBottom ? 'bottom-full border-b-slate-900' : 'top-full border-t-slate-900'
            }`}
          />
        </span>
      )}
    </span>
  )
}
