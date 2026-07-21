import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Map the Tailwind width tokens we use to pixel widths so the portal popover
// (position: fixed, outside any overflow-hidden card) can center itself.
const WIDTH_PX = { 'w-64': 256, 'w-72': 288, 'w-80': 320, 'w-96': 384 }

export default function Tooltip({ content, children, width = 'w-64', placement = 'top' }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const isBottom = placement === 'bottom'
  const widthPx = WIDTH_PX[width] || 256

  // Position the portalled popover relative to the trigger using viewport
  // coords, clamped to the window so it never overflows the screen edges.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    const margin = 8
    const half = widthPx / 2
    let left = r.left + r.width / 2
    left = Math.min(Math.max(left, half + margin), window.innerWidth - half - margin)
    const top = isBottom ? r.bottom + margin : r.top - margin
    setCoords({ top, left })
  }, [open, isBottom, widthPx])

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open &&
        content &&
        createPortal(
          <span
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: widthPx,
              transform: `translateX(-50%)${isBottom ? '' : ' translateY(-100%)'}`,
            }}
            className="pointer-events-none z-[100] block animate-fadeIn rounded-xl border border-slate-700/60 bg-slate-900/95 px-3.5 py-3 text-left text-xs font-medium leading-relaxed text-slate-100 shadow-2xl ring-1 ring-black/5 backdrop-blur"
          >
            {content}
            <span
              className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                isBottom ? 'bottom-full border-b-slate-900' : 'top-full border-t-slate-900'
              }`}
            />
          </span>,
          document.body,
        )}
    </span>
  )
}
