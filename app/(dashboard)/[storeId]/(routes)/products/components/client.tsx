<<<<<<< HEAD
'use client'

import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { ApiList } from '@/components/ui/api-list'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'

import { columns, ProductColumn } from './columns'

interface ProductClientProps {
  data: ProductColumn[]
}

export const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Products (${data.length})`}
          description="Update your store's products."
        />

        <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
          <Plus className="mr-2 w-4 h-4" />
          Add Product
        </Button>
      </div>

      <Separator />

      <DataTable columns={columns} data={data} searchKey="name" />

      <Heading
        title="API"
        description="Use this API to get the products for your store."
      />
      <Separator />

      <ApiList entityName="products" entityIdName="productId" />
    </>
  )
}
=======
"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ProductColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface ProductClientProps{
    data: ProductColumn[]
}

export const ProductClient: React.FC<ProductClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();


    return (
        <>
         <div className="flex items-center justify-between">
            <Heading 
            title={`Products (${data.length})`}
            description="Manage products for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
         </div>
         <Separator  />
         <DataTable searchKey="name" columns={columns} data={data} />
         <Heading title="API" description="API calls for Products" />
         <Separator /> 
         <ApiList entityName="products" entityIdName="productId" />
        </>
    )
}
>>>>>>> aebd7e4 (Products Entity)
