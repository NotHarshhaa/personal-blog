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
          'transition-all duration-300 hover:bg-white/80 dark:hover:bg-zinc-800/80 motion-safe:md:hover:scale-105 motion-safe:md:hover:shadow-md motion-reduce:transform-none'
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
          className='focus-visible:ring-ring rounded-full transition-all outline-none focus-visible:ring-2'
        >
          <Avatar className='size-8'>
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>
              <UserIcon className='size-4' />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='w-72 animate-fade-in rounded-xl border border-border/30 bg-white/95 p-0 shadow-2xl dark:bg-zinc-900/95'
      >
        {/* User Info Card */}
        <div className='flex flex-col items-center gap-2 px-5 py-4 border-b border-border/20 bg-gradient-to-b from-gray-50/80 to-white/80 dark:from-zinc-900/80 dark:to-zinc-900/90'>
          <Avatar className='size-14 shadow-md'>
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>
              <UserIcon className='size-7' />
            </AvatarFallback>
          </Avatar>
          <div className='text-center'>
            <div className='truncate text-lg font-semibold'>{name}</div>
            <div className='text-muted-foreground truncate text-xs'>{email}</div>
            {role && (
              <span
                className={cn(
                  'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  roleColors[role] || roleColors.user
                )}
              >
                <BadgeCheck className='size-3.5' />
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className='py-2'>
          <DropdownMenuItem asChild>
            <Link href={`/users/${id}`} className='flex items-center gap-2 px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800 rounded-md'>
              <UserIcon className='size-4 opacity-70' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/me/posts' className='flex items-center gap-2 px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800 rounded-md'>
              <FileText className='size-4 opacity-70' />
              <span>Posts</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/me/settings' className='flex items-center gap-2 px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800 rounded-md'>
              <Settings className='size-4 opacity-70' />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className='flex items-center gap-2 px-4 py-2 text-destructive focus:text-destructive rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30 w-full cursor-pointer'
        >
          <LogOut className='size-4 opacity-70' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Menu
