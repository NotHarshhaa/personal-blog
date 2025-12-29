import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import PageHeader from '@/components/page-header'
import { getCurrentUser } from '@/lib/auth'

import Danger from './danger'
import SettingsForm from './settings-form'
import { Github, Twitter, Linkedin } from 'lucide-react'

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

  return (
    <>
      <PageHeader title={title} description={description} />
      <div className='my-8 sm:my-12 space-y-8 sm:space-y-12'>
        <SettingsForm
          user={{
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            github: user.github ?? '',
            twitter: user.twitter ?? '',
            linkedin: user.linkedin ?? '',
            theme: user.theme ?? 'system',
          }}
        />
        <Danger />
      </div>
    </>
  )
}

export default SettingsPage
