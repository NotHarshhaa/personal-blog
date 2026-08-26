import type { Editor } from '@tiptap/react'

import { VideoIcon } from 'lucide-react'
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

type YoutubeDialogProps = {
  editor: Editor
}

export const YoutubeDialog = ({ editor }: YoutubeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')

  const handleOpen = (open: boolean) => {
    if (open) {
      setUrl('')
    }
    setIsOpen(open)
  }

  const handleInsert = () => {
    const trimmed = url.trim()
    if (!trimmed) return

    editor.chain().focus().setYoutubeVideo({ src: trimmed }).run()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          tooltip="Embed YouTube Video"
          icon={<VideoIcon className="size-4" />}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Video</DialogTitle>
          <DialogDescription>
            Paste a YouTube video link (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)
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
            <Label htmlFor="youtube-url" className="text-sm font-medium">
              YouTube Video URL
            </Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="h-9"
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!url.trim()}>
              Embed Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
