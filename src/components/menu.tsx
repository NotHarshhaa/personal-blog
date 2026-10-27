'use client'

import type { User } from '@/db/schema'

import {
  Bookmark,
  Compass,
  FileText,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  SquareTerminal,
  UserIcon
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

import { CornerBrackets } from '@/components/frame'
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
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'hover-hatch px-2.5 text-xs'
        )}
      >
        Log in
      </Link>
    )
  }

  const { id, email, role, name, image: rawImage } = user
  const image = rawImage ?? ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          aria-label='User menu'
          className='focus-visible:ring-ring/40 outline-none focus-visible:ring-2'
        >
          <Avatar className='border-border size-8 border sm:size-9'>
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className='bg-muted'>
              <UserIcon className='size-3.5 sm:size-4' />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='border-border bg-card relative w-64 p-0 shadow-xl'
      >
        <CornerBrackets />
        <div className='border-border bg-muted/40 border-b px-3.5 py-2 font-mono'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-[10px] font-bold tracking-widest uppercase'>
              {'// User session'}
            </span>
            {role && (
              <span className='border-border bg-foreground text-background border px-1.5 py-0.5 text-[9px] font-bold uppercase'>
                {role}
              </span>
            )}
          </div>
        </div>

        <div className='border-border border-b px-4 py-3.5'>
          <div className='flex items-center gap-3'>
            <Avatar className='border-border size-9 border'>
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className='bg-muted font-mono text-xs'>
                {name.slice(0, 2).toUpperCase() || 'OP'}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='text-foreground truncate text-xs font-bold'>{name}</p>
              <p className='text-muted-foreground truncate font-mono text-[10px]'>{email}</p>
            </div>
          </div>
        </div>

        <div className='p-1 font-mono text-xs'>
          <DropdownMenuItem asChild>
            <Link href={`/users/${id}`} className='cursor-pointer gap-2'>
              <UserIcon className='text-muted-foreground size-3.5' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/me/posts' className='cursor-pointer gap-2'>
              <FileText className='text-muted-foreground size-3.5' />
              <span>My Posts &amp; Studio</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/bookmarks' className='cursor-pointer gap-2'>
              <Bookmark className='text-muted-foreground size-3.5' />
              <span>Bookmarks</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/roadmaps' className='cursor-pointer gap-2'>
              <Compass className='text-muted-foreground size-3.5' />
              <span>Roadmaps</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/snippets' className='cursor-pointer gap-2'>
              <SquareTerminal className='text-muted-foreground size-3.5' />
              <span>Snippet Vault</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/newsletter' className='cursor-pointer gap-2'>
              <Mail className='text-muted-foreground size-3.5' />
              <span>Newsletter Dispatch</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/me/settings' className='cursor-pointer gap-2'>
              <Settings className='text-muted-foreground size-3.5' />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          {role === 'admin' && (
            <DropdownMenuItem asChild>
              <Link href='/admin' className='text-foreground cursor-pointer gap-2 font-medium'>
                <ShieldCheck className='size-3.5' />
                <span>Admin Console</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className='bg-border' />

        <div className='p-1 font-mono text-xs'>
          <DropdownMenuItem
            onClick={() => signOut()}
            className='text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2'
          >
            <LogOut className='size-3.5' />
            <span>Log out</span>
          </DropdownMenuItem>
        </div>

        <div className='border-border bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-3.5 py-2 font-mono text-[9px] tracking-widest uppercase'>
          <span className='inline-flex items-center gap-1.5'>
            <span className='bg-foreground size-1.5 animate-pulse rounded-full' aria-hidden />
            <span>Session active</span>
          </span>
          <span>v2.4</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Menu
