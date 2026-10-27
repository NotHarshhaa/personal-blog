import type { Editor } from '@tiptap/react'

import katex from 'katex'
import { CheckIcon, SigmaIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { ToolbarButton } from './toolbar-button'

type MathDialogProps = {
  editor: Editor
}

const FORMULA_TEMPLATES = [
  {
    label: 'AI Parameters',
    latex: '27\\text{ B Parameters} \\times 2\\text{ bytes} \\approx 54\\text{ GB}'
  },
  { label: 'Fraction', latex: '\\frac{a}{b}' },
  { label: 'Power', latex: 'x^{2}' },
  { label: 'Subscript', latex: 'x_{i}' },
  { label: 'Square Root', latex: '\\sqrt{x}' },
  { label: 'Summation', latex: '\\sum_{i=1}^{n} x_i' },
  { label: 'Integral', latex: '\\int_{a}^{b} f(x) dx' },
  { label: 'Times (×)', latex: '\\times' },
  { label: 'Approx (≈)', latex: '\\approx' }
]

export const MathDialog = ({ editor }: MathDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [latex, setLatex] = useState('')
  const [isDisplay, setIsDisplay] = useState(true)

  const handleOpen = (open: boolean) => {
    if (open) {
      setLatex('')
      setIsDisplay(true)
    }
    setIsOpen(open)
  }

  const handleInsert = () => {
    const trimmed = latex.trim()
    if (!trimmed) return

    editor.chain().focus().setMath({ latex: trimmed, display: isDisplay }).run()
    setIsOpen(false)
  }

  const livePreviewHtml = useMemo(() => {
    try {
      return katex.renderToString(latex || '\\dots', {
        displayMode: isDisplay,
        throwOnError: false
      })
    } catch {
      return '<span class="text-destructive text-xs font-mono">Invalid LaTeX formula</span>'
    }
  }, [latex, isDisplay])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          tooltip='Insert Math Formula (LaTeX)'
          shortcut='$$'
          icon={<SigmaIcon className='size-4' />}
        />
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-full max-w-[calc(100vw-2rem)] min-w-0 overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <SigmaIcon className='size-5' />
            <span>Insert Math Formula</span>
          </DialogTitle>
          <DialogDescription>
            Write LaTeX mathematical expressions and formulas. Supports both inline and centered
            display mode.
          </DialogDescription>
        </DialogHeader>

        <div className='w-full min-w-0 space-y-4 py-2'>
          {/* Quick templates */}
          <div className='w-full min-w-0 space-y-1.5'>
            <span className='text-muted-foreground text-xs font-medium'>
              Quick Symbols & Templates:
            </span>
            <div className='flex flex-wrap gap-1.5'>
              {FORMULA_TEMPLATES.map((item) => (
                <button
                  key={item.label}
                  type='button'
                  onClick={() => setLatex((prev) => (prev ? `${prev} ${item.latex}` : item.latex))}
                  className='border-border/80 bg-muted/40 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md border px-2 py-1 text-xs font-medium transition-colors'
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className='w-full min-w-0 space-y-2'>
            <Label htmlFor='math-latex' className='text-sm font-medium'>
              LaTeX Equation
            </Label>
            <Textarea
              id='math-latex'
              placeholder='e.g. \text{Establish Baseline} \longrightarrow \text{Profile Bottleneck}'
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className='min-h-[85px] w-full max-w-full min-w-0 resize-y font-mono text-xs break-all'
            />
          </div>

          {/* Display mode toggle */}
          <div className='border-border bg-muted/20 flex w-full min-w-0 items-center justify-between gap-4 rounded-md border px-3 py-2'>
            <div className='min-w-0 space-y-0.5'>
              <Label htmlFor='display-mode' className='cursor-pointer text-xs font-medium'>
                Centered Block Equation
              </Label>
              <p className='text-muted-foreground text-[11px]'>
                Render formula as a standalone centered block ($$) instead of inline ($)
              </p>
            </div>
            <Switch id='display-mode' checked={isDisplay} onCheckedChange={setIsDisplay} />
          </div>

          {/* Live Preview */}
          <div className='border-border bg-background w-full min-w-0 rounded-lg border p-4 shadow-xs'>
            <span className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
              Live Preview:
            </span>
            <div className='mt-2 flex min-h-[50px] w-full max-w-full items-center justify-center overflow-x-auto p-2 text-base'>
              <div
                dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                className='tiptap-katex-render max-w-full overflow-x-auto py-1'
              />
            </div>
          </div>
        </div>

        <DialogFooter className='flex w-full items-center justify-end gap-2 pt-1'>
          <Button type='button' variant='outline' size='sm' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type='button' size='sm' onClick={handleInsert} disabled={!latex.trim()}>
            <CheckIcon className='mr-1.5 size-3.5' />
            Insert Equation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
