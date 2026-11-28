import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/utils'

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>

const Tabs = (props: TabsProps) => {
  const { className, ...rest } = props

  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      className={cn('flex flex-col gap-2', className)}
      {...rest}
    />
  )
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>

const TabsList = (props: TabsListProps) => {
  const { className, ...rest } = props

  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'border-border bg-muted/60 text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-none border p-[3px]',
        className
      )}
      {...rest}
    />
  )
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>

const TabsTrigger = (props: TabsTriggerProps) => {
  const { className, ...rest } = props

  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(
        'text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-transparent px-2.5 py-1 text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color]',
        'hover:text-foreground',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-2xs',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...rest}
    />
  )
}

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>

const TabsContent = (props: TabsContentProps) => {
  const { className, ...rest } = props

  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...rest}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
