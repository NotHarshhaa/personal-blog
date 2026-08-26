import type { Editor } from '@tiptap/react'

import { HighlighterIcon, PaletteIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils'

type ColorPickerProps = {
  editor: Editor
}

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Slate', value: '#64748b' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' }
]

const HIGHLIGHT_COLORS = [
  { label: 'None', value: '' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Purple', value: '#e9d5ff' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
  { label: 'Red', value: '#fecaca' }
]

export const ColorPicker = ({ editor }: ColorPickerProps) => {
  const currentColor = (editor.getAttributes('textStyle').color as string) || ''
  const currentHighlight = (editor.getAttributes('highlight').color as string) || ''

  const handleTextColor = (color: string) => {
    if (color) {
      editor.chain().focus().setColor(color).run()
    } else {
      editor.chain().focus().unsetColor().run()
    }
  }

  const handleHighlight = (color: string) => {
    if (color) {
      editor.chain().focus().setHighlight({ color }).run()
    } else {
      editor.chain().focus().unsetHighlight().run()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors select-none',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            'focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-1',
            (Boolean(currentColor) || Boolean(currentHighlight)) && 'bg-accent text-accent-foreground'
          )}
          aria-label="Colors and highlighting"
        >
          <PaletteIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-2">
        {/* Text Color Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-1.5 px-1 py-1 text-xs text-muted-foreground">
            <PaletteIcon className="size-3.5" />
            <span>Text Color</span>
          </DropdownMenuLabel>
          <div className="grid grid-cols-5 gap-1.5 p-1">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                onClick={() => handleTextColor(c.value)}
                className={cn(
                  'size-6 rounded-full border border-border transition-transform hover:scale-110 flex items-center justify-center',
                  currentColor === c.value && 'ring-2 ring-primary ring-offset-1'
                )}
                style={{ backgroundColor: c.value || 'var(--foreground)' }}
              >
                {!c.value && <span className="text-[9px] text-background font-bold">A</span>}
              </button>
            ))}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Highlight Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-1.5 px-1 py-1 text-xs text-muted-foreground">
            <HighlighterIcon className="size-3.5" />
            <span>Highlight</span>
          </DropdownMenuLabel>
          <div className="grid grid-cols-4 gap-1.5 p-1">
            {HIGHLIGHT_COLORS.map((h) => (
              <button
                key={h.label}
                type="button"
                title={h.label}
                onClick={() => handleHighlight(h.value)}
                className={cn(
                  'h-6 rounded border border-border text-[10px] font-medium transition-transform hover:scale-105 flex items-center justify-center text-black',
                  currentHighlight === h.value && 'ring-2 ring-primary ring-offset-1'
                )}
                style={{ backgroundColor: h.value || 'transparent' }}
              >
                {h.value ? h.label.slice(0, 3) : 'Off'}
              </button>
            ))}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
