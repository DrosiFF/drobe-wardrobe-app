'use client'

import { useEffect } from 'react'
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react'
import { useUIStore, Toast as ToastType } from '@/lib/stores/ui'

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const toastStyles = {
  success: 'bg-green-900/90 border-green-700 text-green-100',
  error: 'bg-red-900/90 border-red-700 text-red-100',
  warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
  info: 'bg-blue-900/90 border-blue-700 text-blue-100'
}

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useUIStore()
  const Icon = toastIcons[toast.type]

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, removeToast])

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
        shadow-lg max-w-sm w-full transition-opacity duration-200
        ${toastStyles[toast.type]}
      `}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-90 mt-1">{toast.message}</p>
        )}
      </div>
      
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors duration-150"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastContainer

