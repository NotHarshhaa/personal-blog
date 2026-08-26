'use client'

import { KeyboardIcon } from 'lucide-react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

type EditorStatsProps = {
  text: string
}

const SHORTCUTS = [
  { group: 'Formatting', items: [
    { label: 'Bold', shortcut: 'Ctrl + B' },
    { label: 'Italic', shortcut: 'Ctrl + I' },
    { label: 'Underline', shortcut: 'Ctrl + U' },
    { label: 'Strikethrough', shortcut: 'Ctrl + Shift + S' },
    { label: 'Inline Code', shortcut: 'Ctrl + E' },
    { label: 'Highlight', shortcut: 'Ctrl + Shift + H' },
    { label: 'Link', shortcut: 'Ctrl + K' }
  ]},
  { group: 'Headings & Blocks', items: [
    { label: 'Paragraph', shortcut: 'Ctrl + Alt + 0' },
    { label: 'Heading 1', shortcut: 'Ctrl + Alt + 1' },
    { label: 'Heading 2', shortcut: 'Ctrl + Alt + 2' },
    { label: 'Heading 3', shortcut: 'Ctrl + Alt + 3' },
    { label: 'Bullet List', shortcut: 'Ctrl + Shift + 8' },
    { label: 'Numbered List', shortcut: 'Ctrl + Shift + 7' },
    { label: 'Task List', shortcut: 'Ctrl + Shift + 9' },
    { label: 'Code Block', shortcut: 'Ctrl + Alt + C' },
    { label: 'Blockquote', shortcut: 'Ctrl + Shift + B' }
  ]},
  { group: 'History & Actions', items: [
    { label: 'Undo', shortcut: 'Ctrl + Z' },
    { label: 'Redo', shortcut: 'Ctrl + Y / Ctrl + Shift + Z' },
    { label: 'Align Left', shortcut: 'Ctrl + Shift + L' },
    { label: 'Align Center', shortcut: 'Ctrl + Shift + E' },
    { label: 'Align Right', shortcut: 'Ctrl + Shift + R' },
    { label: 'Justify', shortcut: 'Ctrl + Shift + J' }
  ]}
]

export const EditorStats = ({ text }: EditorStatsProps) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const cleanText = text.trim()
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0
  const chars = text.length
  const readingMinutes = Math.max(1, Math.ceil(words / 200))

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded hover:text-foreground transition-colors"
              aria-label="Keyboard shortcuts"
            >
              <KeyboardIcon className="size-3.5" />
              <span>Shortcuts</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <KeyboardIcon className="size-5" />
                <span>Editor Keyboard Shortcuts</span>
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {SHORTCUTS.map((group) => (
                <div key={group.group}>
                  <div className="mb-2 text-xs font-semibold text-foreground">
                    {group.group}
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">{item.label}</span>
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                          {item.shortcut}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 font-mono text-[11px]">
        <span>{words} {words === 1 ? 'word' : 'words'}</span>
        <span aria-hidden>·</span>
        <span>{chars} {chars === 1 ? 'char' : 'chars'}</span>
        <span aria-hidden>·</span>
        <span>~{readingMinutes} min read</span>
      </div>
    </div>
  )
}
