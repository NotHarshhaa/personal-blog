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
}

const CommandDialog = (props: CommandDialogProps) => {
  const {
    title = 'Command Palette',
    description = 'Search for a command to run...',
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
        className='overflow-hidden p-0 border border-border bg-card/95 shadow-2xl backdrop-blur-md rounded-none sm:max-w-2xl md:max-w-3xl duration-150'
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
          {children}
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
      className='flex h-14 items-center gap-3 border-b border-border bg-muted/20 px-4'
    >
      <SearchIcon className='size-4 shrink-0 text-muted-foreground' />
      <CommandPrimitive.Input
        data-slot='command-input'
        className={cn(
          'flex h-12 w-full bg-transparent text-sm placeholder:text-muted-foreground',
          'border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...rest}
      />
      <kbd className='hidden sm:inline-flex items-center border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase select-none'>
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
        'max-h-[380px] sm:max-h-[460px] scroll-py-2 overflow-y-auto overflow-x-hidden p-1',
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
      className={cn('py-10 text-center text-sm text-muted-foreground', className)}
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
        'group relative flex cursor-pointer select-none items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm transition-colors outline-none',
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
      className={cn('text-muted-foreground ml-auto font-mono text-[10px] tracking-wider', className)}
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
