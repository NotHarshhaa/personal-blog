'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'

import { cn } from '@/utils'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'

type CommandProps = React.ComponentProps<typeof CommandPrimitive>

const Command = (props: CommandProps) => {
  const { className, ...rest } = props

  return (
    <CommandPrimitive
      data-slot='command'
      className={cn(
        'bg-popover text-popover-foreground flex size-full flex-col overflow-hidden',
        className
      )}
      {...rest}
    />
  )
}

type CommandDialogProps = React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  shouldFilter?: boolean
}

const CommandDialog = (props: CommandDialogProps) => {
  const {
    title = 'Command Palette',
    description = 'Search for a command to run...',
    shouldFilter,
    children,
    ...rest
  } = props

  return (
    <Dialog {...rest}>
      <DialogHeader className='sr-only'>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className='border-border bg-card/95 overflow-hidden rounded-none border p-0 shadow-2xl backdrop-blur-md duration-150 sm:max-w-2xl md:max-w-3xl'
      >
        <Command
          className={cn(
            '**:data-[slot=command-input-wrapper]:h-14',
            '[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:uppercase',
            '[&_[cmdk-group]]:px-2 [&_[cmdk-group]]:py-1',
            '[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-2',
            '[&_[cmdk-input-wrapper]_svg]:size-5',
            '[&_[cmdk-input]]:h-14 [&_[cmdk-input]]:text-sm',
            '[&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5'
          )}
        >
          <Command shouldFilter={shouldFilter}>{children}</Command>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input>

const CommandInput = (props: CommandInputProps) => {
  const { className, ...rest } = props

  return (
    <div
      data-slot='command-input-wrapper'
      className='border-border bg-muted/20 flex h-14 items-center gap-3 border-b px-4'
    >
      <SearchIcon className='text-muted-foreground size-4 shrink-0' />
      <CommandPrimitive.Input
        data-slot='command-input'
        className={cn(
          'placeholder:text-muted-foreground flex h-12 w-full bg-transparent text-sm',
          'border-0 ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...rest}
      />
      <kbd className='border-border bg-background text-muted-foreground hidden items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase select-none sm:inline-flex'>
        ESC
      </kbd>
    </div>
  )
}

type CommandListProps = React.ComponentProps<typeof CommandPrimitive.List>

const CommandList = (props: CommandListProps) => {
  const { className, ...rest } = props

  return (
    <CommandPrimitive.List
      data-slot='command-list'
      className={cn(
        'max-h-[380px] scroll-py-2 overflow-x-hidden overflow-y-auto p-1 sm:max-h-[460px]',
        '[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]',
        className
      )}
      {...rest}
    />
  )
}

type CommandEmptyProps = React.ComponentProps<typeof CommandPrimitive.Empty>

const CommandEmpty = (props: CommandEmptyProps) => {
  const { className, ...rest } = props

  return (
    <CommandPrimitive.Empty
      data-slot='command-empty'
      className={cn('text-muted-foreground py-10 text-center text-sm', className)}
      {...rest}
    />
  )
}

type CommandGroupProps = React.ComponentProps<typeof CommandPrimitive.Group>

const CommandGroup = (props: CommandGroupProps) => {
  const { className, ...rest } = props

  return (
    <CommandPrimitive.Group
      data-slot='command-group'
      className={cn(
        'text-foreground overflow-hidden',
        '[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:uppercase',
        className
      )}
      {...rest}
    />
  )
}

type CommandSeparatorProps = React.ComponentProps<typeof CommandPrimitive.Separator>

const CommandSeparator = (props: CommandSeparatorProps) => {
  const { className, ...rest } = props

  return (
    <CommandPrimitive.Separator
      data-slot='command-separator'
      className={cn('bg-border my-1.5 h-px', className)}
      {...rest}
    />
  )
}

type CommandItemProps = React.ComponentProps<typeof CommandPrimitive.Item>

const CommandItem = (props: CommandItemProps) => {
  const { className, ...rest } = props

  return (
    <CommandPrimitive.Item
      data-slot='command-item'
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm transition-colors outline-none select-none',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        'data-[selected=true]:border-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        className
      )}
      {...rest}
    />
  )
}

type CommandShortcutProps = React.ComponentProps<'span'>

const CommandShortcut = (props: CommandShortcutProps) => {
  const { className, ...rest } = props

  return (
    <span
      data-slot='command-shortcut'
      className={cn(
        'text-muted-foreground ml-auto font-mono text-[10px] tracking-wider',
        className
      )}
      {...rest}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
}
