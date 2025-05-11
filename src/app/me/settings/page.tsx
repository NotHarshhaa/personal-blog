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
      <div className='my-8 space-y-12'>
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
        <div className="flex gap-3 mt-2">
          {user.github && (
            <a href={user.github} target="_blank" rel="noopener noreferrer" title="GitHub">
              <Github className="w-5 h-5 hover:text-primary" />
            </a>
          )}
          {user.twitter && (
            <a href={user.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
              <Twitter className="w-5 h-5 hover:text-primary" />
            </a>
          )}
          {user.linkedin && (
            <a href={user.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <Linkedin className="w-5 h-5 hover:text-primary" />
            </a>
          )}
        </div>
        <Danger />
      </div>
    </>
  )
}

export default SettingsPage
