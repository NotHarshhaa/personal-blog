import type { Editor } from '@tiptap/react'

import { ImageIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ToolbarButton } from './toolbar-button'

type ImageDialogProps = {
  editor: Editor
}

const isValidImageSrc = (value: string): boolean => {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export const ImageDialog = ({ editor }: ImageDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [src, setSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [title, setTitle] = useState('')
  const [previewError, setPreviewError] = useState(false)

  const handleOpen = (open: boolean) => {
    if (open) {
      setSrc('')
      setAlt('')
      setTitle('')
      setPreviewError(false)
    }
    setIsOpen(open)
  }

  const trimmedSrc = src.trim()
  const isSrcValid = isValidImageSrc(trimmedSrc)

  const handleInsert = () => {
    if (!isSrcValid) return

    editor
      .chain()
      .focus()
      .setImage({
        src: trimmedSrc,
        alt: alt.trim() || undefined,
        title: title.trim() || undefined
      })
      .run()

    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton tooltip='Insert Image' icon={<ImageIcon className='size-4' />} />
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Enter a publicly accessible image URL to insert into your document.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleInsert()
          }}
          className='space-y-4 py-2'
        >
          <div className='space-y-2'>
            <Label htmlFor='image-src' className='text-sm font-medium'>
              Image URL
            </Label>
            <Input
              id='image-src'
              type='text'
              placeholder='https://example.com/image.jpg or /images/...'
              value={src}
              onChange={(e) => {
                setSrc(e.target.value)
                setPreviewError(false)
              }}
              aria-invalid={Boolean(trimmedSrc) && !isSrcValid}
              required
              className='h-9 font-mono text-xs'
            />
            {Boolean(trimmedSrc) && !isSrcValid && (
              <p className='text-destructive font-mono text-[11px]'>
                Must be an https://, http://, or /relative image path
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='image-alt' className='text-sm font-medium'>
                Alt text <span className='text-muted-foreground text-xs'>(required for SEO)</span>
              </Label>
              <Input
                id='image-alt'
                type='text'
                placeholder='Describe the image'
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className='h-9'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='image-title' className='text-sm font-medium'>
                Caption <span className='text-muted-foreground text-xs'>(shown below image & in lightbox)</span>
              </Label>
              <Input
                id='image-title'
                type='text'
                placeholder='e.g. NVIDIA GB200 NVL72 liquid-cooled rack architecture'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='h-9'
              />
            </div>
          </div>

          {/* Quick preset for uploaded post images */}
          <div className='flex items-center gap-1.5 pt-0.5'>
            <span className='text-muted-foreground font-mono text-[10px] uppercase'>Preset:</span>
            <button
              type='button'
              onClick={() => {
                setSrc('/images/posts/nvidia-gb200-nvl72.jpg')
                setAlt('NVIDIA GB200 NVL72 liquid-cooled rack architecture')
                setTitle('NVIDIA GB200 NVL72 liquid-cooled rack architecture. Source: NVIDIA Developer')
                setPreviewError(false)
              }}
              className='border-border hover:border-foreground hover:text-foreground text-muted-foreground inline-flex cursor-pointer items-center gap-1 border px-2 py-0.5 font-mono text-[10px] transition-colors'
            >
              + NVIDIA GB200 NVL72 Rack
            </button>
          </div>

          {/* Live Preview */}
          {isSrcValid ? (
            <div className='border-border bg-muted/30 border p-3 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
                  Preview (Clickable with rounded corners)
                </span>
                {previewError && (
                  <span className='text-destructive font-mono text-[10px]'>Failed to load</span>
                )}
              </div>
              <div className='mt-2 flex flex-col items-center justify-center overflow-hidden'>
                {previewError ? (
                  <span className='text-destructive p-4 text-xs'>
                    The URL did not resolve to a loadable image
                  </span>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- previewing user entered image url */}
                    <img
                      src={src.trim()}
                      alt={alt || title || 'Preview'}
                      onError={() => setPreviewError(true)}
                      className='max-h-48 max-w-full rounded-2xl border border-border/80 object-contain shadow-sm'
                    />
                    {(title || alt) && (
                      <p className='mt-2 text-center font-sans text-xs italic text-muted-foreground'>
                        {title || alt}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsOpen(false)}
              className='cursor-pointer'
            >
              Cancel
            </Button>
            <Button type='submit' size='sm' disabled={!isSrcValid} className='cursor-pointer'>
              Insert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
