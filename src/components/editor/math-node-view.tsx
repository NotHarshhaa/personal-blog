'use client'

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import katex from 'katex'
import { CheckIcon, Edit2Icon, SigmaIcon } from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/utils'

export const MathNodeView = (props: ReactNodeViewProps) => {
  const { node, updateAttributes, selected, editor } = props
  const [isEditing, setIsEditing] = useState(false)
  const [latex, setLatex] = useState((node.attrs.latex as string) || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const isBlock = Boolean(node.attrs.display)

  useEffect(() => {
    setLatex((node.attrs.latex as string) || '')
  }, [node.attrs.latex])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(latex || '\\dots', {
        displayMode: isBlock,
        throwOnError: false
      })
    } catch {
      return `<span class="text-destructive font-mono text-xs">Invalid formula</span>`
    }
  }, [latex, isBlock])

  const handleSave = () => {
    updateAttributes({ latex: latex.trim() })
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setLatex((node.attrs.latex as string) || '')
      setIsEditing(false)
    }
  }

  let mathContent: ReactNode

  if (isEditing) {
    mathContent = (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
        className={cn(
          'mx-auto flex items-center gap-1.5 p-3',
          isBlock ? 'w-full max-w-md' : 'w-auto'
        )}
      >
        <span className='text-muted-foreground'>
          <SigmaIcon className='size-3.5' />
        </span>
        <input
          ref={inputRef}
          type='text'
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder='e.g. 27 \times 2 \approx 54'
          className='border-border bg-background text-foreground flex-1 rounded border px-2 py-1 font-mono text-xs focus:outline-hidden'
        />
        <button
          type='submit'
          className='bg-primary text-primary-foreground inline-flex size-6 cursor-pointer items-center justify-center rounded hover:opacity-90'
          title='Apply formula (Enter)'
        >
          <CheckIcon className='size-3' />
        </button>
      </form>
    )
  } else if (isBlock) {
    mathContent = (
      <div className='relative w-full max-w-full'>
        {/* Header bar with Edit button in edit mode */}
        {editor.isEditable && (
          <div className='border-border/60 bg-muted/50 text-muted-foreground flex items-center justify-between border-b px-3 py-1 text-[11px]'>
            <span className='font-mono text-[10px] tracking-wider uppercase'>LaTeX Math Block</span>
            <button
              type='button'
              onClick={() => setIsEditing(true)}
              className='border-border/50 bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground inline-flex cursor-pointer items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium transition-colors'
              title='Edit formula'
            >
              <Edit2Icon className='size-3' />
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Horizontally scrollable formula content area */}
        <div
          className='w-full max-w-full touch-pan-x overflow-x-auto overflow-y-hidden px-4 py-2.5 text-center focus:outline-hidden'
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            className='tiptap-katex-render inline-block min-w-full text-center'
          />
        </div>
      </div>
    )
  } else {
    mathContent = (
      <button
        type='button'
        className='inline-flex max-w-full cursor-pointer items-center overflow-x-auto align-middle'
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- editor.isEditable is a runtime value from Tiptap
          if (!isEditing && editor.isEditable) {
            setIsEditing(true)
          }
        }}
      >
        <span
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          className='tiptap-katex-render inline-block'
        />
        {editor.isEditable && (
          <span className='ml-1 shrink-0 opacity-0 transition-opacity group-hover/math:opacity-80'>
            <Edit2Icon className='text-muted-foreground size-3' />
          </span>
        )}
      </button>
    )
  }

  return (
    <NodeViewWrapper
      as={isBlock ? 'div' : 'span'}
      contentEditable={false}
      className={cn(
        'group/math not-prose relative max-w-full min-w-0 transition-all select-none',
        isBlock
          ? 'border-border bg-card my-2 block w-full overflow-hidden border shadow-none sm:my-3'
          : 'border-border/60 bg-muted/30 inline-flex max-w-full items-center border px-1.5 py-0.5 align-middle',
        selected && editor.isEditable && 'ring-primary ring-2 ring-offset-1',
        isEditing && 'ring-primary ring-2'
      )}
    >
      {mathContent}
    </NodeViewWrapper>
  )
}
