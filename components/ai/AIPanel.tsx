'use client'

import { useState } from 'react'
import {
  Sparkles,
  FileText,
  Tag,
  Pencil,
  SpellCheck,
  Mic,
  MicOff,
  X,
  Loader2,
  Copy,
  Check,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useVoiceRecording, VoiceLanguage } from '@/lib/hooks/useVoiceRecording'

interface AIPanelProps {
  noteContent: string
  onClose: () => void
  onInsertText?: (text: string) => void
  onUpdateSummary?: (summary: string) => void
  onSuggestTags?: (tags: string[]) => void
}

type AIAction = 'summarize' | 'auto-tag' | 'improve' | 'grammar' | 'assistant'

export function AIPanel({
  noteContent,
  onClose,
  onInsertText,
  onUpdateSummary,
  onSuggestTags,
}: AIPanelProps) {
  const [loading, setLoading] = useState<AIAction | null>(null)
  const [result, setResult] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([])
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>('ko-KR')

  const {
    isRecording,
    fullTranscript,
    error: voiceError,
    isSupported: voiceSupported,
    toggleRecording,
    clearTranscript,
  } = useVoiceRecording({ language: voiceLanguage })

  const handleAction = async (action: AIAction) => {
    if (!noteContent.trim()) {
      setResult('메모 내용이 없습니다.')
      return
    }

    setLoading(action)
    setResult('')

    try {
      let endpoint = ''
      let body: Record<string, unknown> = { content: noteContent }

      switch (action) {
        case 'summarize':
          endpoint = '/api/ai/summarize'
          break
        case 'auto-tag':
          endpoint = '/api/ai/auto-tag'
          break
        case 'improve':
          endpoint = '/api/ai/improve'
          break
        case 'grammar':
          endpoint = '/api/ai/grammar'
          break
        case 'assistant':
          endpoint = '/api/ai/assistant'
          body = { noteContent, question, history: conversation }
          break
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('요청에 실패했습니다.')

      const data = await res.json()

      if (action === 'summarize') {
        setResult(data.summary)
        onUpdateSummary?.(data.summary)
      } else if (action === 'auto-tag') {
        const tags = data.tags as string[]
        setResult(`추천 태그: ${tags.join(', ')}`)
        onSuggestTags?.(tags)
      } else if (action === 'improve') {
        setResult(data.improved)
      } else if (action === 'grammar') {
        setResult(data.corrected)
      } else if (action === 'assistant') {
        const answer = data.answer
        setConversation((prev) => [
          ...prev,
          { role: 'user', content: question },
          { role: 'assistant', content: answer },
        ])
        setQuestion('')
      }
    } catch (error) {
      console.error('AI action error:', error)
      setResult('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(null)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    if (result) {
      onInsertText?.(result)
      setResult('')
    }
  }

  const handleInsertTranscript = () => {
    if (fullTranscript) {
      onInsertText?.(fullTranscript)
      clearTranscript()
    }
  }

  const actionButtons = [
    { action: 'summarize' as AIAction, icon: FileText, label: '요약하기' },
    { action: 'auto-tag' as AIAction, icon: Tag, label: '태그 추천' },
    { action: 'improve' as AIAction, icon: Pencil, label: '글 다듬기' },
    { action: 'grammar' as AIAction, icon: SpellCheck, label: '맞춤법 검사' },
  ]

  return (
    <div className="w-80 border-l flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI 어시스턴트
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Action Buttons */}
        <div className="space-y-2">
          {actionButtons.map(({ action, icon: Icon, label }) => (
            <Button
              key={action}
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleAction(action)}
              disabled={loading !== null}
            >
              {loading === action ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {label}
            </Button>
          ))}
        </div>

        {/* Voice Recording */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Mic className="h-4 w-4" />
            음성 녹취
          </h4>

          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value as VoiceLanguage)}
                className="flex-1 text-sm rounded-md border bg-background px-3 py-1.5"
                disabled={isRecording}
              >
                <option value="ko-KR">한국어</option>
                <option value="en-US">English</option>
              </select>

              <Button
                variant={isRecording ? 'destructive' : 'default'}
                size="sm"
                onClick={toggleRecording}
                disabled={!voiceSupported}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" />
                    중지
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" />
                    녹음
                  </>
                )}
              </Button>
            </div>

            {voiceError && (
              <p className="text-xs text-destructive">{voiceError}</p>
            )}

            {fullTranscript && (
              <div className="space-y-2">
                <div className="text-sm bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
                  {fullTranscript}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearTranscript}
                    className="flex-1"
                  >
                    지우기
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleInsertTranscript}
                    className="flex-1"
                  >
                    삽입하기
                  </Button>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                녹음 중...
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">결과</h4>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm bg-muted rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {result}
            </div>
            {onInsertText && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={handleInsert}
              >
                메모에 삽입
              </Button>
            )}
          </div>
        )}

        {/* AI Chat */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">AI에게 질문하기</h4>

          {conversation.length > 0 && (
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'text-sm rounded-lg p-2',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted mr-4'
                  )}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAction('assistant')
                }
              }}
            />
            <Button
              size="icon"
              onClick={() => handleAction('assistant')}
              disabled={!question.trim() || loading === 'assistant'}
            >
              {loading === 'assistant' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
