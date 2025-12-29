'use client'

import type { User } from '@/db/schema'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui'
import { UserIcon, LogOut, Settings, FileText, BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  admin: 'bg-green-500 text-white',
  moderator: 'bg-blue-500 text-white',
  user: 'bg-muted text-foreground',
  guest: 'bg-gray-200 text-gray-700',
}

type MenuProps = {
  user: User | null
}

const Menu = ({ user }: MenuProps) => {
  const pathname = usePathname()

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${pathname}`}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'rounded-xl transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary hover:border-primary/20 motion-safe:md:hover:scale-105 motion-safe:md:hover:shadow-md motion-reduce:transform-none font-medium'
        )}
      >
        Log in
      </Link>
    )
  }

  const { id, email = '', role, name: rawName, image: rawImage } = user

  const name = rawName || 'User'
  const image = rawImage || ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          aria-label='User menu'
          className='focus-visible:ring-ring rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:ring-2 hover:ring-primary/20'
        >
          <Avatar className='size-8 sm:size-9 border-2 border-border/30 shadow-sm transition-transform hover:scale-110'>
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10'>
              <UserIcon className='size-3.5 sm:size-4 text-primary' />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='w-72 sm:w-80 animate-fade-in rounded-2xl border border-border/40 bg-white/95 p-0 shadow-xl backdrop-blur-md dark:bg-zinc-900/95 dark:shadow-2xl overflow-hidden'
      >
        {/* User Info Card */}
        <div className='relative flex flex-col items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-5 border-b border-border/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden'>
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 w-full">
            <Avatar className='size-12 sm:size-16 border-2 border-primary/20 shadow-lg ring-2 ring-primary/10'>
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10'>
                <UserIcon className='size-5 sm:size-7 text-primary' />
              </AvatarFallback>
            </Avatar>
            <div className='text-center w-full'>
              <div className='flex items-center justify-center gap-2 flex-wrap'>
                <div className='truncate text-base sm:text-lg font-bold'>{name}</div>
                {role && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold shadow-sm border shrink-0',
                      role === 'admin' && 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:bg-green-500/20',
                      role === 'moderator' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 dark:bg-blue-500/20',
                      role === 'user' && 'bg-muted/50 text-muted-foreground border-border/50',
                      !roleColors[role] && 'bg-muted/50 text-muted-foreground border-border/50'
                    )}
                  >
                    <BadgeCheck className='size-3 sm:size-3.5' />
                    <span className="hidden sm:inline">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                    <span className="sm:hidden">{role.charAt(0).toUpperCase()}</span>
                  </span>
                )}
              </div>
              <div className='text-muted-foreground truncate text-xs mt-1'>{email}</div>
            </div>
          </div>
        </div>

        <div className='py-1.5 sm:py-2 px-1.5 sm:px-2'>
          <DropdownMenuItem asChild>
            <Link
              href={`/users/${id}`}
              className='flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-all rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-primary'
            >
              <div className="flex items-center justify-center size-7 sm:size-8 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
                <UserIcon className='size-3.5 sm:size-4 text-primary' />
              </div>
              <span className="font-medium text-sm sm:text-base">Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href='/me/posts'
              className='flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-all rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-primary'
            >
              <div className="flex items-center justify-center size-7 sm:size-8 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
                <FileText className='size-3.5 sm:size-4 text-primary' />
              </div>
              <span className="font-medium text-sm sm:text-base">My Posts</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href='/me/settings'
              className='flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-all rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-primary'
            >
              <div className="flex items-center justify-center size-7 sm:size-8 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
                <Settings className='size-3.5 sm:size-4 text-primary' />
              </div>
              <span className="font-medium text-sm sm:text-base">Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-border/40" />

        <div className='p-1.5 sm:p-2'>
          <DropdownMenuItem
            onClick={() => signOut()}
            className='flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-destructive focus:text-destructive rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30 w-full cursor-pointer'
          >
            <div className="flex items-center justify-center size-7 sm:size-8 rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0">
              <LogOut className='size-3.5 sm:size-4 text-red-600 dark:text-red-400' />
            </div>
            <span className="font-medium text-sm sm:text-base">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Menu
