'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  CalendarIcon, 
  ChartBarIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid, 
  ChartBarIcon as ChartBarIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid'
import { Square3Stack3DIcon as ShirtIcon, Square3Stack3DIcon as ShirtIconSolid } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'My Items', href: '/items', icon: ShirtIcon, iconSolid: ShirtIconSolid },
  { name: 'Smart Upload', href: '/upload', icon: PlusCircleIcon, iconSolid: PlusCircleIconSolid },
  { name: 'Outfits', href: '/outfits', icon: CalendarIcon, iconSolid: CalendarIconSolid },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <ShirtIconSolid className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">Closet</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = isActive ? item.iconSolid : item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side - Profile */}
          <div className="flex items-center space-x-4">
            <button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Open user menu</span>
              <UserIcon className="h-8 w-8 text-gray-400 p-1" />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = isActive ? item.iconSolid : item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

