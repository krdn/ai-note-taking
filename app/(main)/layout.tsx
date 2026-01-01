'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNewNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '새 메모',
          content: JSON.stringify({
            type: 'doc',
            content: [{ type: 'paragraph' }],
          }),
          plainText: '',
        }),
      })

      if (res.ok) {
        const note = await res.json()
        router.push(`/notes/${note.id}`)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/notes?search=${encodeURIComponent(query)}`)
    } else {
      router.push('/notes')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewNote={handleNewNote}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSearch={handleSearch}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
