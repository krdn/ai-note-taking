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
      model: AI_MODELS.fast,
      max_tokens: 1500,
      system: SYSTEM_PROMPTS.grammar,
      messages: [
        {
          role: 'user',
          content: `다음 텍스트의 맞춤법과 문법을 검사해주세요:\n\n${content}`,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    const corrected = textContent?.type === 'text' ? textContent.text : ''

    return NextResponse.json({ corrected })
  } catch (error) {
    console.error('Grammar check error:', error)
    return NextResponse.json(
      { error: 'Failed to check grammar' },
      { status: 500 }
    )
  }
}
