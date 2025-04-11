'use client'

import { Badge } from '@tszhong0411/ui'
import { ShieldCheckIcon, UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type UserRoleBadgeProps = {
  role: string
  className?: string
}

const UserRoleBadge = ({ role, className }: UserRoleBadgeProps) => {
  const isAdmin = role === 'admin'

  const icon = isAdmin ? (
    <ShieldCheckIcon className='mr-1.5 size-4' />
  ) : (
    <UserIcon className='mr-1.5 size-4' />
  )
  const color = isAdmin ? 'bg-green-600 text-white' : 'bg-muted text-foreground'
  const label = isAdmin ? 'Admin' : 'User'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Badge
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          color,
          className
        )}
      >
        {icon}
        {label}
      </Badge>
    </motion.div>
  )
}

export default UserRoleBadge
