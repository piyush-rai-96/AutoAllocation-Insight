import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

const ToastContext = createContext(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex w-80 animate-slideUp items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl ring-1 ring-black/5 backdrop-blur"
          >
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <p className="flex-1 text-sm leading-snug text-slate-100">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
