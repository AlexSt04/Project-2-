"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ImageUpload from '@/components/ui/image-upload'

const AdminImageUpload: React.FC = () => {
  const params = useParams()
  const storeId = (params as any)?.storeId as string | undefined

  const storageKey = storeId ? `admin_images_${storeId}` : 'admin_images'

  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setImages(JSON.parse(raw))
    } catch (err) {
      console.warn('Failed to read images from localStorage', err)
    }
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(images))
    } catch (err) {
      console.warn('Failed to save images to localStorage', err)
    }
  }, [images, storageKey])

  const onChange = (url: string) => {
    console.log('AdminImageUpload onChange:', url)
    setImages((prev) => [...prev, url])
  }

  const onRemove = (url: string) => {
    console.log('AdminImageUpload onRemove:', url)
    setImages((prev) => prev.filter((u) => u !== url))
  }

  return (
    <div className="mt-4">
      <div className="mb-2 text-sm font-medium">Background image</div>
      <ImageUpload value={images} onChange={onChange} onRemove={onRemove} />

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          {images.map((url) => (
            <div key={url} className="w-40 h-40 bg-gray-100 rounded overflow-hidden">
              <img src={url} alt="uploaded" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminImageUpload 
