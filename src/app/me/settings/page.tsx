import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import PageHeader from '@/components/page-header'
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

  return (
    <div className="relative z-10 w-full space-y-6">
      <PageHeader title={title} description={description} />
      <SettingsForm
        user={{
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          github: user.github ?? '',
          twitter: user.twitter ?? '',
          linkedin: user.linkedin ?? '',
          theme: user.theme ?? 'system'
        }}
      />
      <Danger />
    </div>
  )
}

export default SettingsPage
