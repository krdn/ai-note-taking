import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags - 모든 태그 조회
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - 새 태그 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color, isAutoGen = false } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    // Check if tag already exists
    const existing = await prisma.tag.findUnique({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#6366f1',
        isAutoGen,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Failed to create tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
