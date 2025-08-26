'use client'

import { useState } from 'react'
// Removed framer-motion for performance
import {
  Search,
  Filter,
  User,
  Bell,
  Settings,
  Command,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface TopBarProps {
  onSearch?: (query: string) => void
  onFilterToggle?: () => void
  showFilters?: boolean
}

export default function TopBar({ onSearch, onFilterToggle, showFilters }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <header
      className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <div
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                isSearchFocused ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Search className="w-4 h-4" />
            </div>
            <Input
              type="text"
              placeholder="Search your closet... (⌘K)"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-10 pr-20 h-10 bg-input border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    onSearch?.('')
                  }}
                  className="p-1 hover:bg-accent rounded-md transition-colors duration-200"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilterToggle}
            className={`ghost-button ${showFilters ? 'text-primary bg-accent' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Filters</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="ghost-button relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ghost-button">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
