import type { Metadata } from 'next'

import { UserIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

import { Frame, FrameBody, StripHeader } from '@/components/frame'
import { getCurrentUser } from '@/lib/auth'

import Danger from './danger'
import SettingsForm from './settings-form'

const title = 'Settings'
const description = 'Manage your account settings'

export const metadata: Metadata = {
  title,
  description
}

const SettingsPage = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirect=/me/settings')
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className='relative z-10 w-full space-y-6'>
      <Frame as='header'>
        <StripHeader
          left={
            <>
              <UserIcon className='text-foreground size-3' aria-hidden />
              <span className='text-foreground font-semibold'>Account // Settings</span>
              <span className='hidden sm:inline'>· Member since {memberSince}</span>
            </>
          }
          right={<span>{user.email}</span>}
        />
        <FrameBody className='space-y-1'>
          <h1 className='font-heading text-foreground text-2xl font-semibold tracking-tight sm:text-3xl'>
            {title}
          </h1>
          <p className='text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base'>
            {description} — profile, social links, and appearance.
          </p>
        </FrameBody>
      </Frame>
      <SettingsForm
        user={{
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          github: user.github,
          twitter: user.twitter,
          linkedin: user.linkedin,
          theme: user.theme
        }}
      />
      <Danger />
    </div>
  )
}

export default SettingsPage
