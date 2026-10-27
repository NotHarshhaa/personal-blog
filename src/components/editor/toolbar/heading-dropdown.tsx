import type { Editor } from '@tiptap/react'

import { CheckIcon, ChevronDownIcon, PilcrowIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils'

type HeadingDropdownProps = {
  editor: Editor
}

const HEADING_OPTIONS = [
  {
    level: 0,
    label: 'Paragraph',
    previewClass: 'text-xs font-medium',
    shortcut: 'Ctrl+Alt+0'
  },
  {
    level: 1,
    label: 'Heading 1',
    previewClass: 'text-lg font-bold',
    shortcut: 'Ctrl+Alt+1'
  },
  {
    level: 2,
    label: 'Heading 2',
    previewClass: 'text-base font-bold',
    shortcut: 'Ctrl+Alt+2'
  },
  {
    level: 3,
    label: 'Heading 3',
    previewClass: 'text-sm font-semibold',
    shortcut: 'Ctrl+Alt+3'
  },
  {
    level: 4,
    label: 'Heading 4',
    previewClass: 'text-xs font-semibold',
    shortcut: 'Ctrl+Alt+4'
  },
  {
    level: 5,
    label: 'Heading 5',
    previewClass: 'text-xs font-medium uppercase tracking-wider',
    shortcut: 'Ctrl+Alt+5'
  },
  {
    level: 6,
    label: 'Heading 6',
    previewClass: 'text-[11px] font-medium uppercase tracking-widest',
    shortcut: 'Ctrl+Alt+6'
  }
] as const

export const HeadingDropdown = ({ editor }: HeadingDropdownProps) => {
  const activeOption = HEADING_OPTIONS.find((option) =>
    option.level === 0
      ? editor.isActive('paragraph')
      : editor.isActive('heading', { level: option.level })
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex h-8 items-center gap-1.5 px-2 text-xs font-medium transition-colors select-none',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden',
            activeOption && activeOption.level > 0 && 'text-foreground'
          )}
          aria-label='Text style'
        >
          <span>{activeOption?.label ?? 'Paragraph'}</span>
          <ChevronDownIcon className='size-3.5 opacity-60' aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        {HEADING_OPTIONS.map((option) => {
          const isActive = activeOption?.level === option.level
          return (
            <DropdownMenuItem
              key={option.level}
              onClick={() =>
                option.level === 0
                  ? editor.chain().focus().setParagraph().run()
                  : editor.chain().focus().toggleHeading({ level: option.level }).run()
              }
              className={cn(
                'flex cursor-pointer items-center gap-2 text-xs',
                isActive && 'bg-accent font-semibold'
              )}
            >
              <CheckIcon
                className={cn('size-3.5 shrink-0', !isActive && 'opacity-0')}
                aria-hidden
              />
              <span className={cn('min-w-0 flex-1 truncate', option.previewClass)}>
                {option.label}
              </span>
              <span className='text-muted-foreground ml-auto shrink-0 text-[10px]'>
                {option.shortcut}
              </span>
            </DropdownMenuItem>
          )
        })}
        <div className='border-border text-muted-foreground flex items-center gap-1.5 border-t px-2 py-1.5 text-[10px]'>
          <PilcrowIcon className='size-3 shrink-0' aria-hidden />
          <span>Levels 5-6 render as small caps labels</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
