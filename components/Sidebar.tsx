'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Removed framer-motion for performance
import { useUser, UserButton } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  Shirt, 
  Palette, 
  Sparkles, 
  ShoppingBag, 
  TrendingUp, 
  Settings,
  Search,
  Plus,
  User,
  Calendar
} from 'lucide-react'

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Items', href: '/items', icon: Shirt },
    { name: 'Outfits', href: '/outfits', icon: Palette },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Smart Upload', href: '/upload', icon: Sparkles },
    { name: 'Purchases', href: '/purchases', icon: ShoppingBag },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

export default function Sidebar() {
  const pathname = usePathname()
  
  // Safely handle useUser when Clerk may not be available
  let user = null
  let isLoaded = false
  
  try {
    const result = useUser()
    user = result.user
    isLoaded = result.isLoaded
  } catch (error) {
    // Clerk not available - use defaults
    console.log('Clerk not available, using guest mode')
    isLoaded = true
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-72 bg-panel border-r border-border/50 flex flex-col z-40"
    >
      {/* Brand */}
      <div className="p-6 border-b border-border/30">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shirt className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            Drobe
          </span>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-b border-border/30">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Items
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      {isLoaded && user && (
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-3 mb-3">
            {(() => {
              try {
                return (
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: "bg-[#121216] border border-gray-800",
                        userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-[#1a1a1e]",
                        userButtonPopoverActionButtonText: "text-gray-300 hover:text-white",
                        userButtonPopoverFooter: "bg-[#0f0f11] border-t border-gray-800"
                      }
                    }}
                  />
                )
              } catch (error) {
                return (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )
              }
            })()}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {user.firstName || user.username || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium">Your Digital Drobe</div>
            <div>Organize • Discover • Style</div>
          </div>
        </div>
      )}

      {/* Guest Footer */}
      {isLoaded && !user && (
        <div className="p-4 border-t border-border/30">
          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
            <div className="text-xs text-muted-foreground text-center">
              <div className="font-medium">Your Digital Drobe</div>
              <div>Organize • Discover • Style</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
