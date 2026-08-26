'use client'

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import katex from 'katex'
import { CheckIcon, Edit2Icon, SigmaIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

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

  return (
    <NodeViewWrapper
      as={isBlock ? 'div' : 'span'}
      role={editor.isEditable ? 'button' : undefined}
      tabIndex={editor.isEditable ? 0 : undefined}
      className={cn(
        'group/math relative select-none transition-all',
        editor.isEditable && 'cursor-pointer',
        isBlock
          ? 'my-4 flex flex-col items-center justify-center rounded-lg border border-border/80 bg-muted/20 p-4 text-center'
          : 'inline-flex items-center rounded-md border border-border/60 bg-muted/30 px-1.5 py-0.5 align-middle',
        selected && editor.isEditable && 'ring-2 ring-primary ring-offset-1',
        isEditing && 'ring-2 ring-primary'
      )}
      onClick={() => {
        if (!isEditing && editor.isEditable) {
          setIsEditing(true)
        }
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!isEditing && editor.isEditable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          setIsEditing(true)
        }
      }}
    >
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className={cn(
            'flex items-center gap-1.5',
            isBlock ? 'w-full max-w-md' : 'w-auto'
          )}
        >
          <span className="text-muted-foreground">
            <SigmaIcon className="size-3.5" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="e.g. 27 \times 2 \approx 54"
            className="flex-1 rounded border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-hidden"
          />
          <button
            type="submit"
            className="inline-flex size-6 items-center justify-center rounded bg-primary text-primary-foreground hover:opacity-90"
            title="Apply formula (Enter)"
          >
            <CheckIcon className="size-3" />
          </button>
        </form>
      ) : (
        <div className="relative flex items-center justify-center">
          <span
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            className="tiptap-katex-render pointer-events-none"
          />
          {editor.isEditable && (
            <span className="ml-1 opacity-0 transition-opacity group-hover/math:opacity-80">
              <Edit2Icon className="size-3 text-muted-foreground" />
            </span>
          )}
        </div>
      )}
    </NodeViewWrapper>
  )
}
