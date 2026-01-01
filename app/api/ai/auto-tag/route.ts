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
      max_tokens: 200,
      system: SYSTEM_PROMPTS.autoTag,
      messages: [
        {
          role: 'user',
          content: `다음 메모에 적합한 태그를 추천해주세요:\n\n${content}`,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    const text = textContent?.type === 'text' ? textContent.text : '[]'

    // Parse JSON array from response
    let tags: string[] = []
    try {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        tags = JSON.parse(match[0])
      }
    } catch {
      tags = []
    }

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Auto-tag error:', error)
    return NextResponse.json({ error: 'Failed to generate tags' }, { status: 500 })
  }
}
