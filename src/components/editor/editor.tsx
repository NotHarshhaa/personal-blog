'use client'

import '@/styles/editor.css'

import { EditorContent, type EditorEvents, type EditorOptions, useEditor } from '@tiptap/react'
import { cn } from '@/utils'
import { Loader2Icon } from 'lucide-react'
import { useRef, useState } from 'react'

import { extensions } from './extensions'
import Toolbar from './toolbar'

// Helper for word/char count
function getWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function getCharCount(text: string) {
  return text.length
}

type EditorProps = {
  options?: Partial<EditorOptions>
  onChange?: (editor: EditorEvents['update']['editor']) => void
  placeholder?: string
}

const Editor = (props: EditorProps) => {
  const { options, onChange, placeholder = 'Write your post...' } = props
  const [isFocused, setIsFocused] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none mx-auto focus:outline-none flex-1',
        placeholder,
      },
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
      <div className='flex min-h-[350px] items-center justify-center border border-border bg-background'>
        <Loader2Icon className='mx-auto size-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const plainText = editor.getText() || ''
  const wordCount = getWordCount(plainText)
  const charCount = getCharCount(plainText)

  return (
    <div
      ref={editorRef}
      className={cn(
        'w-full transition-all',
        editor.isEditable && 'border border-border bg-background',
        isFocused && editor.isEditable ? 'ring-1 ring-foreground/20' : '',
        'flex flex-col'
      )}
    >
      {/* Sticky toolbar */}
      {editor.isEditable && (
        <div className='sticky top-0 z-10 border-b border-border bg-card/95 px-1 py-1 sm:px-3 sm:py-2'>
          <Toolbar editor={editor} />
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          'bg-background flex min-h-[300px] sm:min-h-[350px] px-0 py-2 sm:py-4 focus:outline-none',
          editor.isEditable && 'rounded-b-xl px-2 sm:px-3'
        )}
        aria-label='Post editor'
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {/* Word/char count */}
      {editor.isEditable && (
        <div className='flex items-center justify-end gap-2 sm:gap-4 px-2 sm:px-4 pb-1 sm:pb-2 text-xs text-muted-foreground'>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      )}
    </div>
  )
}

export default Editor
