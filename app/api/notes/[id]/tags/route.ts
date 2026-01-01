import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// POST /api/notes/[id]/tags - 노트에 태그 추가
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const { tagId, tagName, tagColor } = body

    let tag

    if (tagId) {
      // Use existing tag
      tag = await prisma.tag.findUnique({ where: { id: tagId } })
    } else if (tagName) {
      // Create or find tag by name
      tag = await prisma.tag.upsert({
        where: { name: tagName },
        create: {
          name: tagName,
          color: tagColor || '#6366f1',
          isAutoGen: !!body.isAutoGen,
        },
        update: {},
      })
    }

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found or created' },
        { status: 400 }
      )
    }

    // Add tag to note
    const noteTag = await prisma.noteTag.upsert({
      where: {
        noteId_tagId: { noteId: id, tagId: tag.id },
      },
      create: {
        noteId: id,
        tagId: tag.id,
      },
      update: {},
      include: { tag: true },
    })

    return NextResponse.json(noteTag)
  } catch (error) {
    console.error('Failed to add tag to note:', error)
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id]/tags - 노트에서 태그 제거
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const { tagId } = await request.json()

    await prisma.noteTag.delete({
      where: {
        noteId_tagId: { noteId: id, tagId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove tag from note:', error)
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    )
  }
}
