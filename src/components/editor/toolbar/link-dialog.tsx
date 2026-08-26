import type { Editor } from '@tiptap/react'

import { LinkIcon, UnlinkIcon } from 'lucide-react'
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

type LinkDialogProps = {
  editor: Editor
}

export const LinkDialog = ({ editor }: LinkDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')

  const isLinkActive = editor.isActive('link')

  const handleOpen = (open: boolean) => {
    if (open) {
      const currentUrl = (editor.getAttributes('link').href as string) || ''
      setUrl(currentUrl)
    }
    setIsOpen(open)
  }

  const handleSave = () => {
    const trimmed = url.trim()
    if (trimmed) {
      const href = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')
        ? trimmed
        : `https://${trimmed}`

      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href, target: '_blank' })
        .run()
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    }
    setIsOpen(false)
  }

  const handleUnlink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          isActive={isLinkActive}
          tooltip="Link"
          shortcut="Ctrl+K"
          icon={<LinkIcon className="size-4" />}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isLinkActive ? 'Edit Link' : 'Insert Link'}</DialogTitle>
          <DialogDescription>
            Enter the destination web address or mailto link.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="space-y-4 py-2"
        >
          <div className="space-y-2">
            <Label htmlFor="link-url" className="text-sm font-medium">
              URL
            </Label>
            <Input
              id="link-url"
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9"
            />
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {isLinkActive ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleUnlink}
              >
                <UnlinkIcon className="mr-1.5 size-3.5" />
                Remove Link
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
