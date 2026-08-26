import type { Editor } from '@tiptap/react'

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ChevronDownIcon
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { ToolbarButton } from './toolbar-button'

type AlignDropdownProps = {
  editor: Editor
}

export const AlignDropdown = ({ editor }: AlignDropdownProps) => {
  const isLeft = editor.isActive({ textAlign: 'left' })
  const isCenter = editor.isActive({ textAlign: 'center' })
  const isRight = editor.isActive({ textAlign: 'right' })
  const isJustify = editor.isActive({ textAlign: 'justify' })

  const getActiveIcon = () => {
    if (isCenter) return <AlignCenterIcon className="size-4" />
    if (isRight) return <AlignRightIcon className="size-4" />
    if (isJustify) return <AlignJustifyIcon className="size-4" />
    return <AlignLeftIcon className="size-4" />
  }

  return (
    <>
      {/* Desktop direct buttons */}
      <div className="hidden sm:flex items-center gap-0.5">
        <ToolbarButton
          isActive={isLeft}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          tooltip="Align Left"
          shortcut="Ctrl+Shift+L"
          icon={<AlignLeftIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={isCenter}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          tooltip="Align Center"
          shortcut="Ctrl+Shift+E"
          icon={<AlignCenterIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={isRight}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          tooltip="Align Right"
          shortcut="Ctrl+Shift+R"
          icon={<AlignRightIcon className="size-4" />}
        />
        <ToolbarButton
          isActive={isJustify}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          tooltip="Justify"
          shortcut="Ctrl+Shift+J"
          icon={<AlignJustifyIcon className="size-4" />}
        />
      </div>

      {/* Mobile compact dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center gap-0.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Text alignment"
            >
              {getActiveIcon()}
              <ChevronDownIcon className="size-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
              <AlignLeftIcon className="mr-2 size-4" />
              <span>Left</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
              <AlignCenterIcon className="mr-2 size-4" />
              <span>Center</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
              <AlignRightIcon className="mr-2 size-4" />
              <span>Right</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
              <AlignJustifyIcon className="mr-2 size-4" />
              <span>Justify</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
