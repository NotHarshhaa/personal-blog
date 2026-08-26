import type { Editor } from '@tiptap/react'

import { ChevronDownIcon, TypeIcon } from 'lucide-react'

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
  { label: 'Default', value: '' },
  { label: 'Sans-Serif', value: 'Inter, system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, Cambria, serif' },
  { label: 'Monospace', value: 'ui-monospace, Menlo, Monaco, monospace' },
  { label: 'Cursive', value: 'cursive' }
]

export const FontFamilyDropdown = ({ editor }: FontFamilyDropdownProps) => {
  const currentFont = (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? ''
  const currentFontLabel = FONTS.find((f) => f.value === currentFont)?.label ?? 'Font'

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
          type="button"
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors select-none',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            'focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-1'
          )}
          aria-label="Font family"
        >
          <TypeIcon className="size-3.5" />
          <span className="hidden sm:inline">{currentFontLabel}</span>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        {FONTS.map((font) => (
          <DropdownMenuItem
            key={font.label}
            onClick={() => handleSelect(font.value)}
            className={cn(
              'cursor-pointer text-xs',
              currentFont === font.value && 'bg-accent font-semibold'
            )}
            style={{ fontFamily: font.value || undefined }}
          >
            {font.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
