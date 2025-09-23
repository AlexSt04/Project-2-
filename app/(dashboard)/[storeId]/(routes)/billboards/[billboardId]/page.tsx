import prismadb from '@/lib/prismadb'

import { BillboardForm } from './components/billboard-form'

const BillboardPage = async ({ params }: { params: Promise<{ storeId: string; billboardId: string }> }) => {
  const resolved = await params
  const billboard = await prismadb.billboard.findUnique({
    where: {
      id: resolved.billboardId,
    },
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
  <BillboardForm initialData={billboard} />
      </div>
    </div>
  )
}

export default BillboardPage
