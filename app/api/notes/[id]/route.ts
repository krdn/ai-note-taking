import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// GET /api/notes/[id] - 단일 메모 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to fetch note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

// PATCH /api/notes/[id] - 메모 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.plainText !== undefined && { plainText: body.plainText }),
        ...(body.summary !== undefined && { summary: body.summary }),
        ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
        ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to update note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id] - 메모 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    await prisma.note.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}
