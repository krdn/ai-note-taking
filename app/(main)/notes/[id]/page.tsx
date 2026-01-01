'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Editor } from '@/components/editor/Editor'
import { AIPanel } from '@/components/ai/AIPanel'
import { cn, debounce, extractPlainText } from '@/lib/utils'

interface Note {
  id: string
  title: string
  content: string
  plainText: string
  summary: string | null
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  isArchived: boolean
  tags: Array<{
    id: string
    tag: { id: string; name: string; color: string }
  }>
}

interface PageProps {
  params: { id: string }
}

export default function NotePage({ params }: PageProps) {
  const { id } = params
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)

  const fetchNote = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes/${id}`)
      if (res.ok) {
        const data = await res.json()
        setNote(data)
      } else {
        router.push('/notes')
      }
    } catch (error) {
      console.error('Failed to fetch note:', error)
      router.push('/notes')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchNote()
  }, [fetchNote])

  const saveNote = async (updates: Partial<Note>) => {
    if (!note) return

    setSaving(true)
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const updated = await res.json()
        setNote(updated)
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setSaving(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveTitle = useCallback(
    debounce((title: string) => saveNote({ title }), 500),
    [note?.id]
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setNote((prev) => (prev ? { ...prev, title } : null))
    debouncedSaveTitle(title)
  }

  const handleContentUpdate = (content: string, plainText: string) => {
    saveNote({ content, plainText })
  }

  const handleToggleFavorite = () => {
    if (note) {
      saveNote({ isFavorite: !note.isFavorite })
    }
  }

  const handleToggleArchive = () => {
    if (note) {
      saveNote({ isArchived: !note.isArchived })
    }
  }

  const handleDelete = async () => {
    if (!note || !confirm('이 메모를 삭제하시겠습니까?')) return

    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      router.push('/notes')
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">메모를 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Note header */}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/notes')}
            title="뒤로 가기"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Input
            value={note.title}
            onChange={handleTitleChange}
            placeholder="제목 없음"
            className="flex-1 border-0 text-lg font-medium focus-visible:ring-0 px-2"
          />

          <div className="flex items-center gap-1">
            {saving && (
              <span className="text-xs text-muted-foreground mr-2">
                저장 중...
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              title={note.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
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
              onClick={() => setShowAIPanel(!showAIPanel)}
              title="AI 기능"
            >
              <Sparkles
                className={cn(
                  'h-4 w-4',
                  showAIPanel && 'text-primary'
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleArchive}
              title={note.isArchived ? '보관 해제' : '보관'}
            >
              <Archive className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="삭제"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <Editor content={note.content} onUpdate={handleContentUpdate} />
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <AIPanel
          noteContent={extractPlainText(note.content)}
          onClose={() => setShowAIPanel(false)}
          onUpdateSummary={(summary) => saveNote({ summary })}
        />
      )}
    </div>
  )
}
