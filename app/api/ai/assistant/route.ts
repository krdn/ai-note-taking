import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODELS, SYSTEM_PROMPTS } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { noteContent, question, history = [] } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const contextMessage = noteContent
      ? `[메모 내용]\n${noteContent}\n\n[질문]\n${question}`
      : question

    const messages = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: contextMessage },
    ]

    const message = await anthropic.messages.create({
      model: AI_MODELS.default,
      max_tokens: 1500,
      system: SYSTEM_PROMPTS.assistant,
      messages,
    })

    const textContent = message.content.find((block) => block.type === 'text')
    const answer = textContent?.type === 'text' ? textContent.text : ''

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to get answer' },
      { status: 500 }
    )
  }
}
