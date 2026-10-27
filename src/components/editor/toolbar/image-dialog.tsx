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

  const handleInsert = () => {
    const trimmedSrc = src.trim()
    if (!trimmedSrc) return

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
              type='url'
              placeholder='https://example.com/image.jpg'
              value={src}
              onChange={(e) => {
                setSrc(e.target.value)
                setPreviewError(false)
              }}
              required
              className='h-9 font-mono text-xs'
            />
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
                Title <span className='text-muted-foreground text-xs'>(hover tooltip)</span>
              </Label>
              <Input
                id='image-title'
                type='text'
                placeholder='Optional caption'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='h-9'
              />
            </div>
          </div>

          {/* Live Preview */}
          {src.trim() ? (
            <div className='border-border bg-muted/30 border p-2'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
                  Preview
                </span>
                {previewError && (
                  <span className='text-destructive font-mono text-[10px]'>Failed to load</span>
                )}
              </div>
              <div className='border-border/60 bg-background mt-1 flex max-h-40 items-center justify-center overflow-hidden border'>
                {previewError ? (
                  <span className='text-destructive p-4 text-xs'>
                    The URL did not resolve to a loadable image
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- previewing user entered image url
                  <img
                    src={src.trim()}
                    alt={alt || 'Preview'}
                    onError={() => setPreviewError(true)}
                    className='max-h-36 max-w-full object-contain'
                  />
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
            <Button type='submit' size='sm' disabled={!src.trim()} className='cursor-pointer'>
              Insert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
