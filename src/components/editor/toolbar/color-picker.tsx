import type { Editor } from '@tiptap/react'

import { BaselineIcon, CheckIcon, HighlighterIcon, PaletteIcon } from 'lucide-react'
import { useState } from 'react'

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

/** Grayscale + brand palette for text */
const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Black', value: '#000000' },
  { label: 'Steel', value: '#404040' },
  { label: 'Ash', value: '#737373' },
  { label: 'Silver', value: '#a3a3a3' },
  { label: 'White', value: '#ffffff' },
  { label: 'Blueprint Blue', value: '#1d4ed8' },
  { label: 'Cyan', value: '#0891b2' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Violet', value: '#7c3aed' }
]

/** Colored highlight swatches */
const HIGHLIGHT_COLORS = [
  { label: 'None', value: '' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Lime', value: '#d9f99d' },
  { label: 'Emerald', value: '#a7f3d0' },
  { label: 'Cyan', value: '#a5f3fc' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Violet', value: '#ddd6fe' },
  { label: 'Magenta', value: '#f5d0fe' },
  { label: 'Rose', value: '#fecdd3' },
  { label: 'Amber', value: '#fde68a' },
  { label: 'Orange', value: '#fed7aa' },
  { label: 'Slate', value: '#e2e8f0' }
]

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const ColorPicker = ({ editor }: ColorPickerProps) => {
  const [customHex, setCustomHex] = useState('')
  const currentColor = (editor.getAttributes('textStyle').color as string) || ''
  const currentHighlight = (editor.getAttributes('highlight').color as string) || ''

  const isValidHex = HEX_COLOR_PATTERN.test(customHex.trim())

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

  const handleCustomColor = () => {
    const hex = customHex.trim()
    if (!isValidHex) return
    handleTextColor(hex.toLowerCase())
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex size-8 items-center justify-center text-sm font-medium transition-colors select-none',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden',
            (Boolean(currentColor) || Boolean(currentHighlight)) &&
              'bg-foreground text-background font-semibold'
          )}
          aria-label='Colors and highlighting'
        >
          <PaletteIcon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-64 p-2'>
        {/* Text Color Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className='text-muted-foreground flex items-center gap-1.5 px-1 py-1 text-xs'>
            <BaselineIcon className='size-3.5' aria-hidden />
            <span>Text color</span>
            {currentColor && (
              <span className='ml-auto flex items-center gap-1 font-mono text-[10px] uppercase'>
                <span
                  className='border-border inline-block size-3 border'
                  style={{ backgroundColor: currentColor || 'transparent' }}
                />
                {currentColor || 'default'}
              </span>
            )}
          </DropdownMenuLabel>
          <div className='grid grid-cols-8 gap-1 p-1'>
            {TEXT_COLORS.map((c) => {
              const isSelected = currentColor === c.value
              return (
                <button
                  key={c.label}
                  type='button'
                  title={c.label}
                  onClick={() => handleTextColor(c.value)}
                  className={cn(
                    'border-border/80 relative flex size-6 items-center justify-center border transition-transform hover:scale-110',
                    !c.value && 'bg-background',
                    isSelected && 'ring-foreground ring-2 ring-offset-1'
                  )}
                  style={{ backgroundColor: c.value || undefined }}
                >
                  {!c.value && <span className='text-foreground text-[9px] font-bold'>A</span>}
                  {isSelected && c.value && (
                    <CheckIcon
                      className={cn(
                        'size-3',
                        ['#000000', '#1d4ed8', '#0d9488', '#16a34a', '#9333ea', '#7c3aed'].includes(
                          c.value
                        )
                          ? 'text-white'
                          : 'text-black'
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom hex input */}
          <div className='mt-1 flex items-center gap-1.5 px-1 pb-1'>
            <span
              aria-hidden
              className='border-border size-6 shrink-0 border'
              style={{ backgroundColor: isValidHex ? customHex.trim() : undefined }}
            />
            <input
              type='text'
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCustomColor()
                }
              }}
              placeholder='#1d4ed8'
              aria-label='Custom text color hex code'
              className={cn(
                'bg-background h-7 w-full border px-2 font-mono text-xs uppercase transition-colors outline-none',
                customHex && !isValidHex
                  ? 'border-destructive text-destructive'
                  : 'border-border focus:border-foreground'
              )}
            />
            <button
              type='button'
              onClick={handleCustomColor}
              disabled={!isValidHex}
              className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-flex h-7 shrink-0 cursor-pointer items-center border px-2 font-mono text-[10px] font-semibold tracking-wider uppercase transition-colors disabled:pointer-events-none disabled:opacity-40'
            >
              Set
            </button>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Highlight Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className='text-muted-foreground flex items-center gap-1.5 px-1 py-1 text-xs'>
            <HighlighterIcon className='size-3.5' aria-hidden />
            <span>Highlight</span>
            {currentHighlight && (
              <span className='ml-auto flex items-center gap-1 font-mono text-[10px] uppercase'>
                <span
                  className='border-border inline-block size-3 border'
                  style={{ backgroundColor: currentHighlight }}
                />
                {currentHighlight}
              </span>
            )}
          </DropdownMenuLabel>
          <div className='grid grid-cols-6 gap-1 p-1'>
            {HIGHLIGHT_COLORS.map((h) => {
              const isSelected = currentHighlight === h.value
              return (
                <button
                  key={h.label}
                  type='button'
                  title={h.label}
                  onClick={() => handleHighlight(h.value)}
                  className={cn(
                    'border-border/80 flex size-6 items-center justify-center border transition-transform hover:scale-110',
                    !h.value && 'bg-background',
                    isSelected && 'ring-foreground ring-2 ring-offset-1'
                  )}
                  style={{ backgroundColor: h.value || undefined }}
                >
                  {!h.value && (
                    <span className='text-muted-foreground text-[8px] font-bold'>OFF</span>
                  )}
                  {isSelected && h.value && <CheckIcon className='size-3 text-black' />}
                </button>
              )
            })}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
