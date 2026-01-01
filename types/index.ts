export interface Note {
  id: string
  title: string
  content: string
  plainText: string
  summary: string | null
  createdAt: Date
  updatedAt: Date
  isFavorite: boolean
  isArchived: boolean
  tags: NoteTag[]
}

export interface Tag {
  id: string
  name: string
  color: string
  isAutoGen: boolean
  createdAt: Date
}

export interface NoteTag {
  id: string
  noteId: string
  tagId: string
  tag: Tag
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  text: string
  tags?: string[]
  suggestions?: string[]
}

export type AIAction =
  | 'summarize'
  | 'auto-tag'
  | 'improve'
  | 'expand'
  | 'grammar'
  | 'tone'
  | 'translate'
  | 'assistant'

export interface VoiceLanguage {
  code: string
  name: string
}

export const VOICE_LANGUAGES: VoiceLanguage[] = [
  { code: 'ko-KR', name: '한국어' },
  { code: 'en-US', name: 'English' },
]
