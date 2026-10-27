'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon }
] as const

type ThemeToggleProps = {
  className?: string
  /** 'segmented' shows all three modes; 'icon' is a single light/dark cycle button */
  variant?: 'segmented' | 'icon'
}

const ThemeToggle = ({ className, variant = 'segmented' }: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    if (variant === 'icon') {
      return (
        <div
          className={cn('border-border bg-muted/40 inline-flex size-8 border', className)}
          aria-hidden
        />
      )
    }
    return (
      <div
        className={cn('border-border bg-muted/40 inline-flex h-8 min-w-[6rem] border', className)}
        aria-hidden
      />
    )
  }

  if (variant === 'icon') {
    const isDark = resolvedTheme === 'dark'
    const Icon = isDark ? Moon : Sun

    return (
      <button
        type='button'
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        title={`${isDark ? 'Dark' : 'Light'} theme — click to switch`}
        className={cn(
          'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center border transition-colors',
          className
        )}
      >
        <Icon className='size-3.5' strokeWidth={2} />
      </button>
    )
  }

  return (
    <div
      role='group'
      aria-label='Theme'
      className={cn('border-border bg-background inline-flex h-8 items-stretch border', className)}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type='button'
            onClick={() => setTheme(value)}
            aria-label={`${label} theme`}
            aria-pressed={active}
            title={label}
            className={cn(
              'flex h-8 min-w-8 flex-1 cursor-pointer items-center justify-center transition-colors',
              'focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
              active
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className='size-3.5' strokeWidth={2} />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
