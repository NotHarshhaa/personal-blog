'use client'

import { BubbleMenu as TipTapBubbleMenu, type Editor } from '@tiptap/react'
import {
  BoldIcon,
  CheckIcon,
  CodeIcon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ItalicIcon,
  Link2OffIcon,
  LinkIcon,
  StrikethroughIcon,
  TextQuoteIcon,
  UnderlineIcon,
  XIcon
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/utils'

type BubbleMenuProps = {
  editor: Editor
}

const bubbleButtonClass = (isActive: boolean) =>
  cn(
    'inline-flex size-7 items-center justify-center text-xs font-medium transition-colors',
    isActive
      ? 'bg-foreground text-background font-semibold'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  )

export const EditorBubbleMenu = ({ editor }: BubbleMenuProps) => {
  const [isLinkEditing, setIsLinkEditing] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const linkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLinkEditing) {
      requestAnimationFrame(() => linkInputRef.current?.select())
    }
  }, [isLinkEditing])

  const openLinkEditor = () => {
    setLinkUrl((editor.getAttributes('link').href as string) || '')
    setIsLinkEditing(true)
  }

  const applyLink = () => {
    const trimmed = linkUrl.trim()
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setIsLinkEditing(false)
      return
    }
    const href =
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('#')
        ? trimmed
        : `https://${trimmed}`
    editor.chain().focus().extendMarkRange('link').setLink({ href, target: '_blank' }).run()
    setIsLinkEditing(false)
  }

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setIsLinkEditing(false)
  }

  return (
    <TipTapBubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: 'top',
        animation: 'shift-away'
      }}
      className={cn(
        'border-border bg-popover flex items-center border p-1 shadow-lg backdrop-blur-sm',
        isLinkEditing && 'w-72 gap-1'
      )}
    >
      {isLinkEditing ? (
        <>
          <input
            ref={linkInputRef}
            type='text'
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyLink()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                setIsLinkEditing(false)
              }
            }}
            placeholder='https://example.com'
            aria-label='Link URL'
            className='border-border bg-background focus:border-foreground h-7 min-w-0 flex-1 border px-2 font-mono text-xs outline-none'
          />
          <button
            type='button'
            onClick={applyLink}
            className='bg-foreground text-background inline-flex size-7 items-center justify-center transition-opacity hover:opacity-80'
            title='Apply link (Enter)'
            aria-label='Apply link'
          >
            <CheckIcon className='size-3.5' />
          </button>
          {editor.isActive('link') && (
            <button
              type='button'
              onClick={removeLink}
              className='text-muted-foreground hover:bg-muted hover:text-destructive inline-flex size-7 items-center justify-center transition-colors'
              title='Remove link'
              aria-label='Remove link'
            >
              <Link2OffIcon className='size-3.5' />
            </button>
          )}
          <button
            type='button'
            onClick={() => setIsLinkEditing(false)}
            className='text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center transition-colors'
            title='Cancel (Esc)'
            aria-label='Cancel link editing'
          >
            <XIcon className='size-3.5' />
          </button>
        </>
      ) : (
        <>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={bubbleButtonClass(editor.isActive('bold'))}
            title='Bold (Ctrl+B)'
            aria-label='Bold'
          >
            <BoldIcon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={bubbleButtonClass(editor.isActive('italic'))}
            title='Italic (Ctrl+I)'
            aria-label='Italic'
          >
            <ItalicIcon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={bubbleButtonClass(editor.isActive('underline'))}
            title='Underline (Ctrl+U)'
            aria-label='Underline'
          >
            <UnderlineIcon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={bubbleButtonClass(editor.isActive('strike'))}
            title='Strikethrough'
            aria-label='Strikethrough'
          >
            <StrikethroughIcon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={bubbleButtonClass(editor.isActive('code'))}
            title='Inline Code'
            aria-label='Inline code'
          >
            <CodeIcon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={bubbleButtonClass(editor.isActive('highlight'))}
            title='Highlight'
            aria-label='Highlight'
          >
            <HighlighterIcon className='size-3.5' />
          </button>

          <div className='bg-border mx-1 h-4 w-px' aria-hidden />

          <button
            type='button'
            onClick={openLinkEditor}
            className={bubbleButtonClass(editor.isActive('link'))}
            title='Link (Ctrl+K)'
            aria-label='Edit link'
          >
            <LinkIcon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={bubbleButtonClass(editor.isActive('heading', { level: 2 }))}
            title='Heading 2'
            aria-label='Heading 2'
          >
            <Heading2Icon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={bubbleButtonClass(editor.isActive('heading', { level: 3 }))}
            title='Heading 3'
            aria-label='Heading 3'
          >
            <Heading3Icon className='size-3.5' />
          </button>

          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={bubbleButtonClass(editor.isActive('blockquote'))}
            title='Blockquote'
            aria-label='Blockquote'
          >
            <TextQuoteIcon className='size-3.5' />
          </button>
        </>
      )}
    </TipTapBubbleMenu>
  )
}
