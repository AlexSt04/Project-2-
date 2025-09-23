import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sizeId: string }> },
) {
  try {
    const { sizeId } = await params

    if (!sizeId) {
      return new NextResponse('Missing sizeId', { status: 400 })
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: sizeId,
      },
    })

    return new NextResponse(JSON.stringify(size), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[SIZE_GET]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; sizeId: string }> },
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

    const { storeId, sizeId } = await params

    if (!sizeId) {
      return new NextResponse('Missing sizeId', { status: 400 })
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

    const size = await prismadb.size.updateMany({
      where: {
        id: sizeId,
      },
      data: {
        name,
        value,
      },
    })

    return new NextResponse(JSON.stringify(size), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[SIZE_PATCH]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; sizeId: string }> },
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { storeId, sizeId } = await params

    if (!sizeId) {
      return new NextResponse('Missing sizeId', { status: 400 })
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

    const size = await prismadb.size.deleteMany({
      where: {
        id: sizeId,
      },
    })

    return new NextResponse(JSON.stringify(size), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[SIZE_DELETE]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
