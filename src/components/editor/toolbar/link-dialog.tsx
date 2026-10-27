import type { Editor } from '@tiptap/react'

import { ExternalLinkIcon, LinkIcon, UnlinkIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { cn } from '@/utils'

import { ToolbarButton } from './toolbar-button'

type LinkDialogProps = {
  editor: Editor
}

const URL_PATTERN = /^(https?:\/\/|mailto:|#|\/)[^\s]*$/i

export const LinkDialog = ({ editor }: LinkDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [newTab, setNewTab] = useState(true)

  const isLinkActive = editor.isActive('link')

  useEffect(() => {
    if (!isOpen) return
    const currentUrl = (editor.getAttributes('link').href as string) || ''
    setUrl(currentUrl)
    setNewTab(
      ((editor.getAttributes('link').target as string | undefined) ?? '_blank') === '_blank'
    )
  }, [editor, isOpen])

  const trimmed = url.trim()
  const isInputEmpty = trimmed.length === 0
  const isValid = isInputEmpty || URL_PATTERN.test(trimmed)

  const handleOpen = (open: boolean) => {
    setIsOpen(open)
  }

  const handleSave = () => {
    const value = url.trim()
    if (!value) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setIsOpen(false)
      return
    }
    if (!URL_PATTERN.test(value)) return

    const href =
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('mailto:') ||
      value.startsWith('#') ||
      value.startsWith('/')
        ? value
        : `https://${value}`

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href,
        target: newTab ? '_blank' : undefined
      })
      .run()
    setIsOpen(false)
  }

  const handleUnlink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setIsOpen(false)
  }

  const handleTestLink = () => {
    if (isValid && !isInputEmpty) {
      globalThis.open(trimmed, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          isActive={isLinkActive}
          tooltip='Link'
          shortcut='Ctrl+K'
          icon={<LinkIcon className='size-4' />}
        />
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isLinkActive ? 'Edit Link' : 'Insert Link'}</DialogTitle>
          <DialogDescription>
            Web address, mailto:, or /relative path — links open with rel=&quot;nofollow&quot;.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className='space-y-4 py-2'
        >
          <div className='space-y-2'>
            <Label htmlFor='link-url' className='text-sm font-medium'>
              URL
            </Label>
            <div className='flex items-center gap-2'>
              <Input
                id='link-url'
                type='text'
                placeholder='https://example.com'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-invalid={Boolean(url) && !isValid}
                className={cn(
                  'h-9 flex-1 font-mono text-xs',
                  Boolean(url) && !isValid && 'border-destructive focus-visible:ring-destructive/40'
                )}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={!isValid || isInputEmpty}
                onClick={handleTestLink}
                title='Open link in a new tab to test it'
                className='h-9 shrink-0 cursor-pointer gap-1.5 px-2.5 font-mono text-[10px] tracking-wider uppercase'
              >
                <ExternalLinkIcon className='size-3.5' />
                Test
              </Button>
            </div>
            {Boolean(url) && !isValid && (
              <p className='text-destructive font-mono text-[11px]'>
                Must start with https://, http://, mailto:, /, or #
              </p>
            )}
          </div>

          <div className='border-border bg-muted/20 flex items-center justify-between border px-3 py-2.5'>
            <div className='space-y-0.5'>
              <Label htmlFor='link-new-tab' className='cursor-pointer text-sm font-medium'>
                Open in new tab
              </Label>
              <p className='text-muted-foreground font-mono text-[10px] tracking-wider uppercase'>
                target=&quot;_blank&quot;
              </p>
            </div>
            <Switch
              id='link-new-tab'
              checked={newTab}
              onCheckedChange={setNewTab}
              aria-label='Open link in new tab'
            />
          </div>

          <DialogFooter className='flex items-center justify-between sm:justify-between'>
            {isLinkActive ? (
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={handleUnlink}
                className='cursor-pointer'
              >
                <UnlinkIcon className='mr-1.5 size-3.5' />
                Remove Link
              </Button>
            ) : (
              <div />
            )}
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsOpen(false)}
                className='cursor-pointer'
              >
                Cancel
              </Button>
              <Button type='submit' size='sm' disabled={!isValid} className='cursor-pointer'>
                Save
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
