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
  { label: 'AI Parameters', latex: '27\\text{ B Parameters} \\times 2\\text{ bytes} \\approx 54\\text{ GB}' },
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
          tooltip="Insert Math Formula (LaTeX)"
          shortcut="$$"
          icon={<SigmaIcon className="size-4" />}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SigmaIcon className="size-5" />
            <span>Insert Math Formula</span>
          </DialogTitle>
          <DialogDescription>
            Write LaTeX mathematical expressions and formulas. Supports both inline and centered display mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick templates */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Quick Symbols & Templates:</span>
            <div className="flex flex-wrap gap-1.5">
              {FORMULA_TEMPLATES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setLatex((prev) => (prev ? `${prev} ${item.latex}` : item.latex))}
                  className="rounded-md border border-border/80 bg-muted/40 px-2 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="math-latex" className="text-sm font-medium">
              LaTeX Equation
            </Label>
            <Textarea
              id="math-latex"
              placeholder="e.g. 27\text{ Billion Parameters} \times 2\text{ bytes} \approx 54\text{ GB of VRAM}"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="min-h-[70px] font-mono text-xs"
            />
          </div>

          {/* Display mode toggle */}
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
            <div className="space-y-0.5">
              <Label htmlFor="display-mode" className="text-xs font-medium">
                Centered Block Equation
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Render formula as a standalone centered block ($$) instead of inline ($)
              </p>
            </div>
            <Switch
              id="display-mode"
              checked={isDisplay}
              onCheckedChange={setIsDisplay}
            />
          </div>

          {/* Live Preview */}
          <div className="rounded-lg border border-border bg-background p-4 shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Preview:
            </span>
            <div className="mt-2 flex min-h-[50px] items-center justify-center overflow-x-auto text-base">
              <span
                dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                className="tiptap-katex-render"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleInsert}
            disabled={!latex.trim()}
          >
            <CheckIcon className="mr-1.5 size-3.5" />
            Insert Equation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
