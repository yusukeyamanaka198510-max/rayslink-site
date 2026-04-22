'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'ホーム', icon: '🏠' },
  { href: '/tasks', label: 'タスク', icon: '✅' },
  { href: '/minutes', label: '議事録', icon: '📝' },
  { href: '/budget', label: '予算', icon: '💰' },
  { href: '/contents', label: 'コンテンツ', icon: '🎉' },
  { href: '/timetable', label: 'タイムテーブル', icon: '🕐' },
  { href: '/script', label: '台本', icon: '🎤' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col shadow-sm z-40">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-rose-600">💒 Our Wedding</h1>
          <p className="text-xs text-gray-500 mt-1">Project Management</p>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-base font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-rose-50 text-rose-600 border-r-2 border-rose-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
        <div className="grid grid-cols-7">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                pathname === item.href
                  ? 'text-rose-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="mt-0.5 leading-tight text-center" style={{ fontSize: '10px' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
