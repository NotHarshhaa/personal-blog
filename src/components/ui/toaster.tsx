'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = (props: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': '0px'
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-none',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-foreground group-[.toast]:text-background group-[.toast]:font-mono group-[.toast]:text-[11px] group-[.toast]:rounded-none group-[.toast]:uppercase group-[.toast]:tracking-wider group-[.toast]:font-semibold',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-mono group-[.toast]:text-[11px] group-[.toast]:rounded-none',
          closeButton:
            'group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:rounded-none'
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
export { toast, useSonner } from 'sonner'
