import type { Editor } from '@tiptap/react'

import { CheckIcon, ChevronDownIcon, TypeIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils'

type FontFamilyDropdownProps = {
  editor: Editor
}

const FONTS = [
  { label: 'Default', value: '', previewClass: '' },
  {
    label: 'Instrument Sans',
    value: 'var(--font-instrument-sans), ui-sans-serif, sans-serif',
    previewClass: ''
  },
  {
    label: 'Space Grotesk',
    value: 'var(--font-space-grotesk), ui-sans-serif, sans-serif',
    previewClass: ''
  },
  { label: 'Serif', value: 'Georgia, Cambria, serif', previewClass: '' },
  {
    label: 'Monospace',
    value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    previewClass: 'text-[11px]'
  }
]

export const FontFamilyDropdown = ({ editor }: FontFamilyDropdownProps) => {
  const currentFontValue =
    (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? ''
  const activeFont = FONTS.find((font) => font.value === currentFontValue)

  const handleSelect = (value: string) => {
    if (value) {
      editor.chain().focus().setFontFamily(value).run()
    } else {
      editor.chain().focus().unsetFontFamily().run()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex h-8 items-center gap-1.5 px-2 text-xs font-medium transition-colors select-none',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden',
            activeFont?.value && 'text-foreground'
          )}
          aria-label='Font family'
        >
          <TypeIcon className='size-3.5' aria-hidden />
          <span className='hidden sm:inline'>{activeFont?.label ?? 'Font'}</span>
          <ChevronDownIcon className='size-3.5 opacity-60' aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48'>
        {FONTS.map((font) => {
          const isActive = activeFont?.value === font.value
          return (
            <DropdownMenuItem
              key={font.label}
              onClick={() => handleSelect(font.value)}
              className={cn('cursor-pointer text-xs', isActive && 'bg-accent font-semibold')}
            >
              <CheckIcon
                className={cn('size-3.5 shrink-0', !isActive && 'opacity-0')}
                aria-hidden
              />
              <span
                className={cn('min-w-0 flex-1 truncate', font.previewClass)}
                style={{ fontFamily: font.value || undefined }}
              >
                {font.label}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
