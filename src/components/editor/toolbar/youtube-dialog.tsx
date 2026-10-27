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
import { Switch } from '@/components/ui/switch'

import { ToolbarButton } from './toolbar-button'

type YoutubeDialogProps = {
  editor: Editor
}

export const YoutubeDialog = ({ editor }: YoutubeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [controls, setControls] = useState(true)
  const [noCookie, setNoCookie] = useState(true)
  const [startSeconds, setStartSeconds] = useState('')

  const handleOpen = (open: boolean) => {
    if (open) {
      setUrl('')
      setControls(true)
      setNoCookie(true)
      setStartSeconds('')
    }
    setIsOpen(open)
  }

  const handleInsert = () => {
    const trimmed = url.trim()
    if (!trimmed) return

    const start = Number.parseInt(startSeconds, 10)

    // controls/nocookie are stored as per-node attributes by the extension at
    // runtime; the upstream command type only declares src/width/height/start
    const embedOptions = {
      src: trimmed,
      controls,
      nocookie: noCookie,
      ...(Number.isFinite(start) && start > 0 ? { start } : {})
    }

    editor.chain().focus().setYoutubeVideo(embedOptions).run()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton tooltip='Embed YouTube Video' icon={<VideoIcon className='size-4' />} />
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Embed Video</DialogTitle>
          <DialogDescription>
            Paste a YouTube link (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)
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
            <Label htmlFor='youtube-url' className='text-sm font-medium'>
              YouTube URL
            </Label>
            <Input
              id='youtube-url'
              type='url'
              placeholder='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className='h-9 font-mono text-xs'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='youtube-start' className='text-sm font-medium'>
              Start at <span className='text-muted-foreground text-xs'>(seconds, optional)</span>
            </Label>
            <Input
              id='youtube-start'
              type='number'
              min={0}
              placeholder='e.g. 90'
              value={startSeconds}
              onChange={(e) => setStartSeconds(e.target.value)}
              className='h-9 font-mono text-xs'
            />
          </div>

          <div className='divide-border border-border divide-y border'>
            <div className='flex items-center justify-between gap-3 px-3 py-2.5'>
              <div className='space-y-0.5'>
                <Label htmlFor='yt-controls' className='cursor-pointer text-sm font-medium'>
                  Show player controls
                </Label>
                <p className='text-muted-foreground font-mono text-[10px] tracking-wider uppercase'>
                  play / volume / fullscreen bar
                </p>
              </div>
              <Switch
                id='yt-controls'
                checked={controls}
                onCheckedChange={setControls}
                aria-label='Toggle player controls'
              />
            </div>
            <div className='flex items-center justify-between gap-3 px-3 py-2.5'>
              <div className='space-y-0.5'>
                <Label htmlFor='yt-nocookie' className='cursor-pointer text-sm font-medium'>
                  Privacy-enhanced mode
                </Label>
                <p className='text-muted-foreground font-mono text-[10px] tracking-wider uppercase'>
                  youtube-nocookie.com embed
                </p>
              </div>
              <Switch
                id='yt-nocookie'
                checked={noCookie}
                onCheckedChange={setNoCookie}
                aria-label='Toggle privacy-enhanced embed'
              />
            </div>
          </div>

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
            <Button type='submit' size='sm' disabled={!url.trim()} className='cursor-pointer'>
              Embed Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
