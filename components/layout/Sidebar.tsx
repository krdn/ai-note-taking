'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  Plus,
  Star,
  Archive,
  Tag,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onNewNote?: () => void
}

const navItems = [
  { href: '/notes', label: '모든 메모', icon: FileText },
  { href: '/notes?filter=favorites', label: '즐겨찾기', icon: Star },
  { href: '/notes?filter=archived', label: '보관함', icon: Archive },
]

export function Sidebar({ isOpen = true, onClose, onNewNote }: SidebarProps) {
  const pathname = usePathname()
  const [tagsExpanded, setTagsExpanded] = useState(true)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold text-lg">메모</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={onNewNote}
            title="새 메모"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/notes' && pathname?.includes(item.href.split('?')[1] || ''))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Tags section */}
          <div className="pt-4">
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {tagsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Tag className="h-4 w-4" />
              태그
            </button>

            {tagsExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  태그가 없습니다
                </p>
              </div>
            )}
          </div>
        </nav>

        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground text-center">
            AI 메모 v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
