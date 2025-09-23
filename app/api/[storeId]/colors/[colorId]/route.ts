import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ colorId: string }> },
) {
  try {
    const { colorId } = await params

    if (!colorId) {
      return new NextResponse('Missing colorId', { status: 400 })
    }

    const color = await prismadb.color.findUnique({
      where: {
        id: colorId,
      },
    })

    return new NextResponse(JSON.stringify(color), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[COLOR_GET]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; colorId: string }> },
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, value } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Missing name', { status: 400 })
    }

    if (!value) {
      return new NextResponse('Missing value', { status: 400 })
    }

    const { storeId, colorId } = await params

    if (!colorId) {
      return new NextResponse('Missing colorId', { status: 400 })
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

    const color = await prismadb.color.updateMany({
      where: {
        id: colorId,
      },
      data: {
        name,
        value,
      },
    })

    return new NextResponse(JSON.stringify(color), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[COLOR_PATCH]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; colorId: string }> },
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { storeId, colorId } = await params

    if (!colorId) {
      return new NextResponse('Missing colorId', { status: 400 })
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

    const color = await prismadb.color.deleteMany({
      where: {
        id: colorId,
      },
    })

    return new NextResponse(JSON.stringify(color), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[COLOR_DELETE]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
