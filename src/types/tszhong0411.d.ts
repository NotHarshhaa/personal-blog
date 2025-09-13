declare module '@/components/ui' {
  import type { ComponentProps } from 'react'

  interface ButtonProps extends ComponentProps<'button'> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
  }

  interface AlertDialogProps extends ComponentProps<'div'> {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }

  interface AlertDialogTriggerProps extends ComponentProps<'div'> {
    asChild?: boolean
  }

  interface AlertDialogContentProps extends ComponentProps<'div'> {
    asChild?: boolean
  }

  interface DropdownMenuProps extends ComponentProps<'div'> {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }

  interface DropdownMenuContentProps extends ComponentProps<'div'> {
    align?: 'start' | 'center' | 'end'
  }

  interface DropdownMenuItemProps extends ComponentProps<'div'> {
    asChild?: boolean
  }

  interface DropdownMenuTriggerProps extends ComponentProps<'button'> {
    asChild?: boolean
  }

  interface AvatarProps extends ComponentProps<'div'> {
    size?: 'sm' | 'md' | 'lg'
  }

  interface TabsProps extends ComponentProps<'div'> {
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
  }

  interface TabsContentProps extends ComponentProps<'div'> {
    value: string
  }

  interface SkeletonProps extends ComponentProps<'div'> {
    className?: string
  }

  interface BadgeProps extends ComponentProps<'div'> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }

  interface FormFieldProps extends ComponentProps<'div'> {
    control?: any
    name: string
    render: ({ field }: { field: any }) => React.ReactElement
  }

  interface DialogProps extends ComponentProps<'div'> {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }

  interface DialogTriggerProps extends ComponentProps<'div'> {
    asChild?: boolean
  }

  interface SelectProps<T> extends Omit<ComponentProps<'select'>, 'value' | 'onChange'> {
    value?: T
    onValueChange?: (value: T) => void
  }

  interface SelectItemProps<T> extends ComponentProps<'div'> {
    value: T
  }

  interface SwitchProps extends ComponentProps<'button'> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }

  export const Button: React.FC<ButtonProps>
  export const Dialog: React.FC<DialogProps>
  export const DialogContent: React.FC<ComponentProps<'div'>>
  export const DialogDescription: React.FC<ComponentProps<'div'>>
  export const DialogFooter: React.FC<ComponentProps<'div'>>
  export const DialogHeader: React.FC<ComponentProps<'div'>>
  export const DialogTitle: React.FC<ComponentProps<'div'>>
  export const DialogTrigger: React.FC<DialogTriggerProps>
  export const Input: React.FC<ComponentProps<'input'>>
  export const Label: React.FC<ComponentProps<'label'>>
  export const Select: React.FC<SelectProps<any>>
  export const SelectContent: React.FC<ComponentProps<'div'>>
  export const SelectItem: React.FC<SelectItemProps<any>>
  export const SelectTrigger: React.FC<ComponentProps<'div'>>
  export const SelectValue: React.FC<ComponentProps<'div'>>
  export const Textarea: React.FC<ComponentProps<'textarea'>>
  export const Separator: React.FC<ComponentProps<'div'>>
  export const Switch: React.FC<SwitchProps>
  export const toast: {
    success: (message: string) => void
    error: (message: string | undefined) => void
  }
  export const Toaster: React.FC<ComponentProps<'div'>>
  export const buttonVariants: (props: { variant?: ButtonProps['variant']; size?: ButtonProps['size']; className?: string }) => string

  // AlertDialog components
  export const AlertDialog: React.FC<AlertDialogProps>
  export const AlertDialogAction: React.FC<ComponentProps<'button'>>
  export const AlertDialogCancel: React.FC<ComponentProps<'button'>>
  export const AlertDialogContent: React.FC<AlertDialogContentProps>
  export const AlertDialogDescription: React.FC<ComponentProps<'div'>>
  export const AlertDialogFooter: React.FC<ComponentProps<'div'>>
  export const AlertDialogHeader: React.FC<ComponentProps<'div'>>
  export const AlertDialogTitle: React.FC<ComponentProps<'div'>>
  export const AlertDialogTrigger: React.FC<AlertDialogTriggerProps>

  // DropdownMenu components
  export const DropdownMenu: React.FC<DropdownMenuProps>
  export const DropdownMenuContent: React.FC<DropdownMenuContentProps>
  export const DropdownMenuItem: React.FC<DropdownMenuItemProps>
  export const DropdownMenuSeparator: React.FC<ComponentProps<'div'>>
  export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps>

  // Avatar components
  export const Avatar: React.FC<AvatarProps>
  export const AvatarImage: React.FC<ComponentProps<'img'>>
  export const AvatarFallback: React.FC<ComponentProps<'div'>>

  // Form components
  export const Form: React.FC<ComponentProps<'form'>>
  export const FormControl: React.FC<ComponentProps<'div'>>
  export const FormField: React.FC<FormFieldProps>
  export const FormItem: React.FC<ComponentProps<'div'>>
  export const FormLabel: React.FC<ComponentProps<'label'>>
  export const FormMessage: React.FC<ComponentProps<'div'>>

  // Tabs components
  export const Tabs: React.FC<TabsProps>
  export const TabsContent: React.FC<TabsContentProps>
  export const TabsList: React.FC<ComponentProps<'div'>>
  export const TabsTrigger: React.FC<ComponentProps<'button'>>

  // Other components
  export const Skeleton: React.FC<SkeletonProps>
  export const Badge: React.FC<BadgeProps>
}

declare module '@/utils' {
  export function cn(...inputs: (string | undefined | null | false)[]): string
  export function range(count: number): number[]
}
