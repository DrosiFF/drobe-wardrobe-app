import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export interface Modal {
  id: string
  title: string
  content: React.ReactNode
  onClose?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

interface UIState {
  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Modal management
  modals: Modal[]
  openModal: (modal: Omit<Modal, 'id'>) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
  
  // Loading states
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  // Sidebar state (mobile)
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // Theme preference
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Toast state
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast: Toast = {
          ...toast,
          id,
          duration: toast.duration ?? 5000
        }
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }))
        
        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, newToast.duration)
        }
        
        return id
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id)
        })),
      clearToasts: () => set({ toasts: [] }),
      
      // Modal state
      modals: [],
      openModal: (modal) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newModal: Modal = {
          ...modal,
          id,
          size: modal.size ?? 'md'
        }
        
        set((state) => ({
          modals: [...state.modals, newModal]
        }))
        
        return id
      },
      closeModal: (id) =>
        set((state) => ({
          modals: state.modals.filter((modal) => modal.id !== id)
        })),
      closeAllModals: () => set({ modals: [] }),
      
      // Loading state
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Sidebar state
      isSidebarOpen: false,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      // Theme state
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          // Persist to localStorage
          localStorage.setItem('drobe-theme', theme)
        }
      },
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      }
    }),
    {
      name: 'drobe-ui-store'
    }
  )
)

// Convenience hook for toasts
export const useToast = () => {
  const { addToast, removeToast, clearToasts } = useUIStore()
  
  return {
    toast: addToast,
    dismiss: removeToast,
    clear: clearToasts,
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message })
  }
}
