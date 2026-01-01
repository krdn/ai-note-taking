'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Plus, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  title: string
  plainText: string
  summary: string | null
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  isArchived: boolean
}

function NotesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const filter = searchParams.get('filter')
  const search = searchParams.get('search')

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/notes'
      const params = new URLSearchParams()

      if (filter === 'favorites') params.set('favorites', 'true')
      if (filter === 'archived') params.set('archived', 'true')
      if (search) params.set('search', search)

      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

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

  const handleToggleFavorite = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !note.isFavorite }),
      })
      fetchNotes()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (!confirm('이 메모를 삭제하시겠습니까?')) return

    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
      fetchNotes()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const getPageTitle = () => {
    if (filter === 'favorites') return '즐겨찾기'
    if (filter === 'archived') return '보관함'
    if (search) return `"${search}" 검색 결과`
    return '모든 메모'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        <Button onClick={handleNewNote}>
          <Plus className="h-4 w-4 mr-2" />
          새 메모
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">메모가 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            새 메모를 만들어 시작하세요
          </p>
          <Button onClick={handleNewNote}>
            <Plus className="h-4 w-4 mr-2" />
            새 메모 만들기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className="group relative rounded-lg border bg-card p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium line-clamp-1 pr-8">
                  {note.title || '제목 없음'}
                </h3>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => handleToggleFavorite(e, note)}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        note.isFavorite && 'fill-yellow-400 text-yellow-400'
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => handleDelete(e, note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {note.summary || note.plainText || '내용 없음'}
              </p>

              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(note.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotesLoading() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-9 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesLoading />}>
      <NotesContent />
    </Suspense>
  )
}
