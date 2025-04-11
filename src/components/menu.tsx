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
} from '@tszhong0411/ui'
import { UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

import { getDefaultImage } from '@/utils/get-default-image'
import { cn } from '@/lib/utils'

type MenuProps = {
  user: User | null
}

const Menu = ({ user }: MenuProps) => {
  const pathname = usePathname()

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${pathname}`}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Log in
      </Link>
    )
  }

  const { name, image, email, id, role } = user
  const defaultImage = getDefaultImage(id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label='User menu'
          className='focus-visible:ring-ring rounded-full transition-all outline-none focus-visible:ring-2'
        >
          <Avatar className='size-8'>
            <AvatarImage src={image ?? defaultImage} alt={name ?? 'User'} />
            <AvatarFallback>
              <UserIcon className='size-4' />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem className='flex cursor-pointer flex-col items-start px-3 py-2' asChild>
          <Link href={`/users/${id}`}>
            <div className='max-w-[180px] truncate text-sm font-medium'>{name}</div>
            <div className='text-muted-foreground max-w-[180px] truncate text-xs'>{email}</div>
            {role && (
              <span
                className={cn(
                  'bg-primary/10 text-primary mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase'
                )}
              >
                {role}
              </span>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href='/me/posts' className='w-full'>
            Posts
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/me/settings' className='w-full'>
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className='text-destructive focus:text-destructive w-full'
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Menu
