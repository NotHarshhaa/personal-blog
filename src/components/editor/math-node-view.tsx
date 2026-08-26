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
      contentEditable={false}
      className={cn(
        'group/math not-prose relative min-w-0 max-w-full transition-all select-none',
        isBlock
          ? 'my-2 sm:my-3 block w-full overflow-hidden border border-border bg-card shadow-none'
          : 'inline-flex max-w-full items-center border border-border/60 bg-muted/30 px-1.5 py-0.5 align-middle',
        selected && editor.isEditable && 'ring-2 ring-primary ring-offset-1',
        isEditing && 'ring-2 ring-primary'
      )}
    >
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className={cn(
            'flex items-center gap-1.5 p-3 mx-auto',
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
            className="inline-flex size-6 items-center justify-center rounded bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
            title="Apply formula (Enter)"
          >
            <CheckIcon className="size-3" />
          </button>
        </form>
      ) : isBlock ? (
        <div className="relative w-full max-w-full">
          {/* Header bar with Edit button in edit mode */}
          {editor.isEditable && (
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground">
              <span className="font-mono text-[10px] uppercase tracking-wider">LaTeX Math Block</span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 rounded border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground cursor-pointer"
                title="Edit formula"
              >
                <Edit2Icon className="size-3" />
                <span>Edit</span>
              </button>
            </div>
          )}

          {/* Horizontally scrollable formula content area */}
          <div
            tabIndex={0}
            className="w-full max-w-full overflow-x-auto overflow-y-hidden px-4 py-2.5 text-center focus:outline-hidden touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              className="tiptap-katex-render inline-block min-w-full text-center"
            />
          </div>
        </div>
      ) : (
        <span
          className="inline-flex max-w-full items-center overflow-x-auto align-middle cursor-pointer"
          onClick={() => {
            if (!isEditing && editor.isEditable) {
              setIsEditing(true)
            }
          }}
        >
          <span
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            className="tiptap-katex-render inline-block"
          />
          {editor.isEditable && (
            <span className="ml-1 opacity-0 transition-opacity group-hover/math:opacity-80 shrink-0">
              <Edit2Icon className="size-3 text-muted-foreground" />
            </span>
          )}
        </span>
      )}
    </NodeViewWrapper>
  )
}
