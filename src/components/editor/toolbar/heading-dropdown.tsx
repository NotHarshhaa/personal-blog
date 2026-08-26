import type { Editor } from '@tiptap/react'

import {
  ChevronDownIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  PilcrowIcon
} from 'lucide-react'

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

export const HeadingDropdown = ({ editor }: HeadingDropdownProps) => {
  const getCurrentLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1'
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2'
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3'
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4'
    return 'Paragraph'
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
          aria-label="Text style"
        >
          <span>{getCurrentLabel()}</span>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={cn(
            'flex items-center gap-2 cursor-pointer text-xs',
            editor.isActive('paragraph') && 'bg-accent font-semibold'
          )}
        >
          <PilcrowIcon className="size-4" />
          <span>Paragraph</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Alt+0</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            'flex items-center gap-2 cursor-pointer text-xs',
            editor.isActive('heading', { level: 1 }) && 'bg-accent font-semibold'
          )}
        >
          <Heading1Icon className="size-4" />
          <span className="text-base font-bold">Heading 1</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Alt+1</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            'flex items-center gap-2 cursor-pointer text-xs',
            editor.isActive('heading', { level: 2 }) && 'bg-accent font-semibold'
          )}
        >
          <Heading2Icon className="size-4" />
          <span className="text-sm font-semibold">Heading 2</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Alt+2</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            'flex items-center gap-2 cursor-pointer text-xs',
            editor.isActive('heading', { level: 3 }) && 'bg-accent font-semibold'
          )}
        >
          <Heading3Icon className="size-4" />
          <span className="text-xs font-semibold">Heading 3</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Alt+3</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={cn(
            'flex items-center gap-2 cursor-pointer text-xs',
            editor.isActive('heading', { level: 4 }) && 'bg-accent font-semibold'
          )}
        >
          <Heading4Icon className="size-4" />
          <span className="text-xs font-medium">Heading 4</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Alt+4</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
