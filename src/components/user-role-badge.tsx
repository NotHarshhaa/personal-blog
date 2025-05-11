'use client'

import { Badge } from '@tszhong0411/ui'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, UserIcon, StarIcon, GlobeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type UserRoleBadgeProps = {
  role: string
  className?: string
  compact?: boolean
}

const roleConfig = {
  admin: {
    icon: <ShieldCheckIcon className='mr-1 size-3.5' />, label: 'Admin', bg: 'bg-green-500', text: 'text-white', shadow: 'shadow-md',
  },
  moderator: {
    icon: <StarIcon className='mr-1 size-3.5' />, label: 'Moderator', bg: 'bg-blue-500', text: 'text-white', shadow: 'shadow-md',
  },
  user: {
    icon: <UserIcon className='mr-1 size-3.5' />, label: 'User', bg: 'bg-muted', text: 'text-foreground', shadow: 'shadow',
  },
  guest: {
    icon: <GlobeIcon className='mr-1 size-3.5' />, label: 'Guest', bg: 'bg-gray-200', text: 'text-gray-700', shadow: 'shadow',
  }
}

const UserRoleBadge = ({ role, className, compact = false }: UserRoleBadgeProps) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('inline-block align-middle', compact && 'text-xs')}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      tabIndex={0}
      aria-label={config.label}
    >
      <Badge
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 font-medium',
          'gap-1',
          config.bg,
          config.text,
          config.shadow,
          'border border-black/10',
          'transition-all duration-150',
          'ml-2', // margin-left for spacing from name
          className,
          compact && 'px-1.5 py-0.5 text-xs'
        )}
        style={{ fontWeight: 500, fontSize: compact ? '0.75rem' : '0.85rem', letterSpacing: '0.01em' }}
      >
        {config.icon}
        {config.label}
      </Badge>
      {showTooltip && (
        <span className="absolute z-50 mt-2 ml-2 rounded bg-black/90 px-2 py-1 text-xs text-white shadow-lg animate-fade-in">
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      )}
    </motion.div>
  )
}

export default UserRoleBadge
