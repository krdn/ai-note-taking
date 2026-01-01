'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect } from 'react'
import { extensions } from './extensions'
import { EditorToolbar } from './EditorToolbar'
import { extractPlainText, debounce } from '@/lib/utils'

interface EditorProps {
  content: string
  onUpdate?: (content: string, plainText: string) => void
  editable?: boolean
}

export function Editor({ content, onUpdate, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions,
    content: content ? JSON.parse(content) : { type: 'doc', content: [] },
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-6 py-4',
      },
    },
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    debounce((jsonContent: string, plainText: string) => {
      onUpdate?.(jsonContent, plainText)
    }, 500),
    [onUpdate]
  )

  useEffect(() => {
    if (!editor || !onUpdate) return

    const handleUpdate = () => {
      const json = editor.getJSON()
      const jsonContent = JSON.stringify(json)
      const plainText = extractPlainText(jsonContent)
      debouncedUpdate(jsonContent, plainText)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, onUpdate, debouncedUpdate])

  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON())
      if (currentContent !== content) {
        editor.commands.setContent(JSON.parse(content))
      }
    }
  }, [editor, content])

  if (!editor) {
    return (
      <div className="flex-1 animate-pulse">
        <div className="h-10 bg-muted border-b" />
        <div className="p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
