'use client'

import { BubbleMenu as TipTapBubbleMenu, type Editor } from '@tiptap/react'
import {
  BoldIcon,
  CodeIcon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  StrikethroughIcon,
  TextQuoteIcon,
  UnderlineIcon
} from 'lucide-react'

import { cn } from '@/utils'

type BubbleMenuProps = {
  editor: Editor
}

export const EditorBubbleMenu = ({ editor }: BubbleMenuProps) => {
  const setLink = () => {
    const previousUrl = (editor.getAttributes('link').href as string) || ''
    const url = globalThis.prompt('URL', previousUrl)
    if (typeof url !== 'string') return
    const trimmed = url.trim()
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const href = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')
      ? trimmed
      : `https://${trimmed}`
    editor.chain().focus().extendMarkRange('link').setLink({ href, target: '_blank' }).run()
  }

  return (
    <TipTapBubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: 'top',
        animation: 'shift-away'
      }}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('bold')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <BoldIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('italic')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <ItalicIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('underline')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Underline (Ctrl+U)"
        aria-label="Underline"
      >
        <UnderlineIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('strike')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <StrikethroughIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('code')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Inline Code"
        aria-label="Inline Code"
      >
        <CodeIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('highlight')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Highlight"
        aria-label="Highlight"
      >
        <HighlighterIcon className="size-3.5" />
      </button>

      <div className="mx-1 h-4 w-px bg-border" />

      <button
        type="button"
        onClick={setLink}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('link')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Link (Ctrl+K)"
        aria-label="Link"
      >
        <LinkIcon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('heading', { level: 2 })
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Heading 2"
        aria-label="Heading 2"
      >
        <Heading2Icon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('heading', { level: 3 })
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Heading 3"
        aria-label="Heading 3"
      >
        <Heading3Icon className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded text-xs font-medium transition-colors',
          editor.isActive('blockquote')
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Blockquote"
        aria-label="Blockquote"
      >
        <TextQuoteIcon className="size-3.5" />
      </button>
    </TipTapBubbleMenu>
  )
}
