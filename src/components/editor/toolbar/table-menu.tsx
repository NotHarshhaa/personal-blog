import type { Editor } from '@tiptap/react'

import {
  ColumnsIcon,
  PlusIcon,
  RowsIcon,
  TableIcon,
  Trash2Icon
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils'

type TableMenuProps = {
  editor: Editor
}

export const TableMenu = ({ editor }: TableMenuProps) => {
  const isTableActive = editor.isActive('table')

  const insertTable = (rows = 3, cols = 3) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run()
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
            isTableActive && 'bg-accent text-accent-foreground'
          )}
          aria-label="Table menu"
        >
          <TableIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {isTableActive ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Table Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="cursor-pointer text-xs"
            >
              <RowsIcon className="mr-2 size-3.5" />
              <span>Add Row Above</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="cursor-pointer text-xs"
            >
              <RowsIcon className="mr-2 size-3.5" />
              <span>Add Row Below</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="cursor-pointer text-xs text-destructive"
            >
              <Trash2Icon className="mr-2 size-3.5" />
              <span>Delete Row</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="cursor-pointer text-xs"
            >
              <ColumnsIcon className="mr-2 size-3.5" />
              <span>Add Column Left</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="cursor-pointer text-xs"
            >
              <ColumnsIcon className="mr-2 size-3.5" />
              <span>Add Column Right</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="cursor-pointer text-xs text-destructive"
            >
              <Trash2Icon className="mr-2 size-3.5" />
              <span>Delete Column</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="cursor-pointer text-xs text-destructive font-medium"
            >
              <Trash2Icon className="mr-2 size-3.5" />
              <span>Delete Table</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Insert Table
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => insertTable(2, 2)} className="cursor-pointer text-xs">
              <PlusIcon className="mr-2 size-3.5" />
              <span>2 × 2 Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTable(3, 3)} className="cursor-pointer text-xs">
              <PlusIcon className="mr-2 size-3.5" />
              <span>3 × 3 Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTable(4, 4)} className="cursor-pointer text-xs">
              <PlusIcon className="mr-2 size-3.5" />
              <span>4 × 4 Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTable(5, 5)} className="cursor-pointer text-xs">
              <PlusIcon className="mr-2 size-3.5" />
              <span>5 × 5 Table</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
