import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)
let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), [])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++_id
    setToasts(prev => [...prev.slice(-4), { id, message, type }])
    if (duration > 0) setTimeout(() => remove(id), duration)
  }, [remove])

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              shadow-xl pointer-events-auto cursor-pointer animate-fadeIn select-none
              ${t.type === 'error'
                ? 'bg-red-950/95 border border-red-700/60 text-red-200'
                : t.type === 'info'
                  ? 'bg-copa-card border border-copa-border text-gray-300'
                  : 'bg-green-950/95 border border-copa-green/60 text-green-200'
              }`}
          >
            <span className="text-base leading-none shrink-0">
              {t.type === 'error' ? '✕' : '✓'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
