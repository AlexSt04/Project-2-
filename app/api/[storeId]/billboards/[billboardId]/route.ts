import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ billboardId: string }> },
) {
  try {
    const { billboardId } = await params

    if (!billboardId) {
      return new NextResponse('Missing billboardId', { status: 400 })
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: billboardId,
      },
    })

    return new NextResponse(JSON.stringify(billboard), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[BILLBOARD_GET]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> },
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { label, imageUrl } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!label) {
      return new NextResponse('Missing label', { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse('Missing imageUrl', { status: 400 })
    }

    const { storeId, billboardId } = await params

    if (!billboardId) {
      return new NextResponse('Missing billboardId', { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    })

    return new NextResponse(JSON.stringify(billboard), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[BILLBOARD_PATCH]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> },
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const { storeId, billboardId } = await params

    if (!billboardId) {
      return new NextResponse('Missing billboardId', { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: billboardId,
      },
    })

    return new NextResponse(JSON.stringify(billboard), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
