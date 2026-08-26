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
  const [previewError, setPreviewError] = useState(false)

  const handleOpen = (open: boolean) => {
    if (open) {
      setSrc('')
      setAlt('')
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
        alt: alt.trim() || undefined
      })
      .run()

    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          tooltip="Insert Image"
          icon={<ImageIcon className="size-4" />}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
          className="space-y-4 py-2"
        >
          <div className="space-y-2">
            <Label htmlFor="image-src" className="text-sm font-medium">
              Image URL
            </Label>
            <Input
              id="image-src"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={src}
              onChange={(e) => {
                setSrc(e.target.value)
                setPreviewError(false)
              }}
              required
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-alt" className="text-sm font-medium">
              Alt Text <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="image-alt"
              type="text"
              placeholder="Brief description of the image"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Live Preview */}
          {src.trim() ? (
            <div className="overflow-hidden rounded-md border border-border bg-muted/30 p-2">
              <span className="text-xs font-medium text-muted-foreground">Preview:</span>
              <div className="mt-1 flex max-h-40 items-center justify-center overflow-hidden">
                {previewError ? (
                  <span className="text-xs text-destructive">Failed to load preview image</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- previewing user entered image url
                  <img
                    src={src.trim()}
                    alt={alt || 'Preview'}
                    onError={() => setPreviewError(true)}
                    className="max-h-36 max-w-full rounded object-contain"
                  />
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!src.trim()}>
              Insert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
