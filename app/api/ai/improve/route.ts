import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODELS, SYSTEM_PROMPTS } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { content, action = 'improve' } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const systemPrompt =
      action === 'expand' ? SYSTEM_PROMPTS.expand : SYSTEM_PROMPTS.improve

    const userPrompt =
      action === 'expand'
        ? `다음 텍스트를 더 풍부하게 확장해주세요:\n\n${content}`
        : `다음 텍스트를 개선해주세요:\n\n${content}`

    const message = await anthropic.messages.create({
      model: AI_MODELS.default,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    const improved = textContent?.type === 'text' ? textContent.text : ''

    return NextResponse.json({ improved })
  } catch (error) {
    console.error('Improve error:', error)
    return NextResponse.json(
      { error: 'Failed to improve text' },
      { status: 500 }
    )
  }
}
