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
  { label: 'Black', value: '#000000' },
  { label: 'Carbon', value: '#171717' },
  { label: 'Graphite', value: '#262626' },
  { label: 'Steel', value: '#404040' },
  { label: 'Gray', value: '#525252' },
  { label: 'Ash', value: '#737373' },
  { label: 'Silver', value: '#a3a3a3' },
  { label: 'Platinum', value: '#d4d4d4' },
  { label: 'White', value: '#ffffff' }
]

const HIGHLIGHT_COLORS = [
  { label: 'None', value: '' },
  { label: 'Dark', value: '#262626' },
  { label: 'Medium', value: '#525252' },
  { label: 'Muted', value: '#737373' },
  { label: 'Silver', value: '#a3a3a3' },
  { label: 'Light', value: '#d4d4d4' },
  { label: 'Ghost', value: '#e5e5e5' },
  { label: 'Subtle', value: '#f5f5f5' }
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
