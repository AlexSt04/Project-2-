import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params

    if (!categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 })
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        billboard: true,
      },
    })

    return new NextResponse(JSON.stringify(category), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[CATEGORY_GET]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; categoryId: string }> },
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, billboardId } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Missing name', { status: 400 })
    }

    if (!billboardId) {
      return new NextResponse('Missing billboardId', { status: 400 })
    }

    const { storeId, categoryId } = await params

    if (!categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 })
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

    const category = await prismadb.category.updateMany({
      where: {
        id: categoryId,
      },
      data: {
        name,
        billboardId,
      },
    })

    return new NextResponse(JSON.stringify(category), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[CATEGORY_PATCH]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; categoryId: string }> },
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { storeId, categoryId } = await params

    if (!categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 })
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

    const category = await prismadb.category.deleteMany({
      where: {
        id: categoryId,
      },
    })

    return new NextResponse(JSON.stringify(category), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[CATEGORY_DELETE]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
