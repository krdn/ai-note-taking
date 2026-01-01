import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODELS, SYSTEM_PROMPTS } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: AI_MODELS.default,
      max_tokens: 500,
      system: SYSTEM_PROMPTS.summarize,
      messages: [
        {
          role: 'user',
          content: `다음 메모 내용을 요약해주세요:\n\n${content}`,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    const summary = textContent?.type === 'text' ? textContent.text : ''

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json(
      { error: 'Failed to summarize' },
      { status: 500 }
    )
  }
}
