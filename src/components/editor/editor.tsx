'use client'

import '@/styles/editor.css'

import {
  EditorContent,
  type EditorEvents,
  type EditorOptions,
  useEditor
} from '@tiptap/react'
import { Loader2Icon } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '@/utils'

import { EditorBubbleMenu } from './bubble-menu'
import { EditorStats } from './editor-stats'
import { extensions } from './extensions'
import Toolbar from './toolbar'

export type EditorProps = {
  options?: Partial<EditorOptions>
  onChange?: (editor: EditorEvents['update']['editor']) => void
  placeholder?: string
  className?: string
  showToolbar?: boolean
  showStats?: boolean
  showBubbleMenu?: boolean
}

export const Editor = (props: EditorProps) => {
  const {
    options,
    onChange,
    placeholder = 'Start writing your post...',
    className,
    showToolbar = true,
    showStats = true,
    showBubbleMenu = true
  } = props

  const [isFocused, setIsFocused] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const isEditable = options?.editable !== false

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose dark:prose-invert max-w-none focus:outline-none flex-1 transition-all',
          isEditable
            ? 'min-h-[320px] sm:min-h-[380px] p-3 sm:p-5'
            : 'min-h-0 p-0'
        ),
        placeholder
      }
    },
    onUpdate: ({ editor: e }) => {
      if (onChange) {
        onChange(e)
      }
    },
    ...options
  })

  if (!editor) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-border bg-card/50">
        <Loader2Icon className="size-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const plainText = editor.getText() || ''

  return (
    <div
      ref={editorRef}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden transition-all duration-200',
        isEditable && 'rounded-lg border border-border bg-background shadow-xs',
        isFocused && isEditable && 'ring-1 ring-ring/30 border-ring/40',
        className
      )}
    >
      {/* Bubble Menu for text selection */}
      {isEditable && showBubbleMenu && (
        <EditorBubbleMenu editor={editor} />
      )}

      {/* Main Sticky Toolbar */}
      {isEditable && showToolbar && (
        <div className="sticky top-0 z-20 border-b border-border/80 bg-card/95 px-2 py-1.5 backdrop-blur-md">
          <Toolbar editor={editor} />
        </div>
      )}

      {/* Editor Content Area */}
      <EditorContent
        editor={editor}
        className="w-full flex-1 bg-transparent"
        aria-label="Rich text editor"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Real-time word/char stats and shortcuts */}
      {isEditable && showStats && (
        <EditorStats text={plainText} />
      )}
    </div>
  )
}

export default Editor
