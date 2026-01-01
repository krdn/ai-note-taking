import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notes - 메모 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const favorites = searchParams.get('favorites') === 'true'
    const archived = searchParams.get('archived') === 'true'

    const notes = await prisma.note.findMany({
      where: {
        ...(search && {
          OR: [
            { title: { contains: search } },
            { plainText: { contains: search } },
          ],
        }),
        ...(favorites && { isFavorite: true }),
        isArchived: archived,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST /api/notes - 새 메모 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, plainText } = body

    const note = await prisma.note.create({
      data: {
        title: title || '새 메모',
        content: content || JSON.stringify({ type: 'doc', content: [] }),
        plainText: plainText || '',
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
