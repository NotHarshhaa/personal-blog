import type { Editor } from '@tiptap/react'

import {
  BaselineIcon,
  CheckIcon,
  ColumnsIcon,
  Grid2x2CheckIcon,
  MergeIcon,
  PlusIcon,
  RowsIcon,
  SplitSquareHorizontalIcon,
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

const menuItemClass = 'cursor-pointer gap-2 text-xs'

const run = (action: () => void) => () => {
  action()
}

export const TableMenu = ({ editor }: TableMenuProps) => {
  const isTableActive = editor.isActive('table')

  const insertTable = (rows = 3, cols = 3) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
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
            isTableActive && 'bg-foreground text-background font-semibold'
          )}
          aria-label='Table menu'
        >
          <TableIcon className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        {isTableActive ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                <TableIcon className='size-3.5' aria-hidden />
                <span>Structure</span>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().addRowBefore().run())}
                className={menuItemClass}
              >
                <RowsIcon className='size-3.5' />
                <span>Insert row above</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().addRowAfter().run())}
                className={menuItemClass}
              >
                <RowsIcon className='size-3.5' />
                <span>Insert row below</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().addColumnBefore().run())}
                className={menuItemClass}
              >
                <ColumnsIcon className='size-3.5' />
                <span>Insert column left</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().addColumnAfter().run())}
                className={menuItemClass}
              >
                <ColumnsIcon className='size-3.5' />
                <span>Insert column right</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                <BaselineIcon className='size-3.5' aria-hidden />
                <span>Headers & cells</span>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().toggleHeaderRow().run())}
                className={menuItemClass}
              >
                <CheckIcon className='size-3.5' />
                <span>Toggle header row</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().toggleHeaderColumn().run())}
                className={menuItemClass}
              >
                <CheckIcon className='size-3.5' />
                <span>Toggle header column</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().mergeOrSplit().run())}
                className={menuItemClass}
              >
                <MergeIcon className='size-3.5' />
                <span>Merge / split cells</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                <Trash2Icon className='size-3.5' aria-hidden />
                <span>Remove</span>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().deleteRow().run())}
                className={cn(menuItemClass, 'text-destructive focus:text-destructive')}
              >
                <Trash2Icon className='size-3.5' />
                <span>Delete row</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().deleteColumn().run())}
                className={cn(menuItemClass, 'text-destructive focus:text-destructive')}
              >
                <Trash2Icon className='size-3.5' />
                <span>Delete column</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={run(() => editor.chain().focus().deleteTable().run())}
                className={cn(menuItemClass, 'text-destructive focus:text-destructive font-medium')}
              >
                <Trash2Icon className='size-3.5' />
                <span>Delete table</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuLabel className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <Grid2x2CheckIcon className='size-3.5' aria-hidden />
              <span>Insert table</span>
            </DropdownMenuLabel>
            {[2, 3, 4, 5].map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => insertTable(size, size)}
                className={menuItemClass}
              >
                <PlusIcon className='size-3.5' />
                <span>
                  {size} × {size} table
                  {size === 3 && (
                    <span className='text-muted-foreground ml-auto text-[10px]'>with header</span>
                  )}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className='text-muted-foreground flex items-center gap-1.5 px-2 py-1.5 text-[10px]'>
              <SplitSquareHorizontalIcon className='size-3 shrink-0' aria-hidden />
              <span>Tip: select multiple cells to merge them</span>
            </div>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
