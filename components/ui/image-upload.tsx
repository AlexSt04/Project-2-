'use client';

// eslint-disable-next-line simple-import-sort/imports
import { useEffect, useState, useRef } from 'react'

import { ImagePlus, Trash } from 'lucide-react'
import toast from 'react-hot-toast'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'

import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = (result: any) => {
    console.log('CldUploadWidget result', result)

    // Recursive scan to find first URL-like string in the result object.
    const findUrlIn = (obj: any): string | null => {
      if (!obj) return null

      // If it's a string and looks like a URL, return it
      if (typeof obj === 'string') {
        if (/^https?:\/\//i.test(obj)) return obj
        return null
      }

      // Arrays: scan elements
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = findUrlIn(item)
          if (found) return found
        }
        return null
      }

      // Objects: prefer common Cloudinary keys first
      if (typeof obj === 'object') {
        const keysPriority = ['secure_url', 'url', 'secureUrl', 'secureURL']
        for (const k of keysPriority) {
          if (typeof obj[k] === 'string' && /^https?:\/\//i.test(obj[k])) return obj[k]
        }

        // also look for nested info/result fields that libraries often use
        const prefer = ['info', 'result', 'event', 'files']
        for (const p of prefer) {
          if (obj[p]) {
            const found = findUrlIn(obj[p])
            if (found) return found
          }
        }

        // fallback: scan all values
        for (const [_k, v] of Object.entries(obj)) {
          const found = findUrlIn(v)
          if (found) return found
        }
      }

      return null
    }

    const url = findUrlIn(result)

    if (url) {
      console.log('Parsed upload URL:', url)
      try {
        onChange(url)
      } catch (err) {
        console.error('onChange threw', err)
      }
      toast.success('Image uploaded')
      setLastUploaded(url)
    } else {
      console.error('Upload result missing URL - full result:', result)
      toast.error('Upload failed')
    }
  }

  // keep a ref to the widget open function so a fallback button can call it
  const openRef = useRef<(() => void) | null>(null)
  const [widgetReady, setWidgetReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [lastUploaded, setLastUploaded] = useState<string | null>(null)

  if (!isMounted) {
    return null
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>

      <CldUploadWidget
        onUpload={onUpload}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'npqhszol'}
      >
        {({ open }) => {
          // store the open fn so the fallback button can call it
          openRef.current = open

          // mark widget as ready so we don't render fallback hint/button
          if (!widgetReady) setWidgetReady(true)

          const onClick = () => open()

          return (
            <div className="mt-2">
              <Button
                type="button"
                disabled={disabled}
                variant="secondary"
                onClick={onClick}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Upload an Image
              </Button>
            </div>
          )
        }}
      </CldUploadWidget>

      {!widgetReady && (
        <div className="mt-2 text-sm text-muted-foreground">
          {/* Hidden file input for direct upload fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

              const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
              const uploadPreset =
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'npqhszol'

              if (!cloudName) {
                console.warn('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
                return
              }

              setIsUploading(true)
              try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('upload_preset', uploadPreset)

                const res = await fetch(
                  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                  { method: 'POST', body: formData },
                )

                const data = await res.json()
                console.log('Direct upload response', res.status, data)
                // Try to find any URL in the response body
                const findUrlIn = (obj: any): string | null => {
                  if (!obj) return null
                  if (typeof obj === 'string') return /^https?:\/\//i.test(obj) ? obj : null
                  if (Array.isArray(obj)) {
                    for (const item of obj) {
                      const f = findUrlIn(item)
                      if (f) return f
                    }
                    return null
                  }
                  if (typeof obj === 'object') {
                    const keysPriority = ['secure_url', 'url', 'secureUrl', 'secureURL']
                    for (const k of keysPriority) {
                      if (typeof obj[k] === 'string' && /^https?:\/\//i.test(obj[k])) return obj[k]
                    }
                    for (const v of Object.values(obj)) {
                      const f = findUrlIn(v)
                      if (f) return f
                    }
                  }
                  return null
                }

                const found = findUrlIn(data)
                if (found) {
                  console.log('Direct upload parsed url:', found)
                  onChange(found)
                  toast.success('Image uploaded')
                  setLastUploaded(found)
                } else {
                  console.error('Direct upload failed - no URL found in response', data)
                }
              } catch (err) {
                console.error('Direct upload error', err)
              } finally {
                setIsUploading(false)
              }
            }}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              disabled={disabled || isUploading}
              variant="secondary"
              onClick={() => {
                if (openRef.current) {
                  openRef.current()
                } else if (fileInputRef.current) {
                  fileInputRef.current.click()
                } else {
                  console.warn(
                    'No upload widget or file input available for uploading images.',
                  )
                }
              }}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload an Image'}
            </Button>

            <div className="mt-1 text-xs text-muted-foreground">
              Upload widget not ready — using direct upload fallback.
            </div>
          </div>

          {lastUploaded && (
            <div className="mt-2 text-sm">
              Last uploaded:{' '}
              <a
                href={lastUploaded}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                {lastUploaded}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUpload
