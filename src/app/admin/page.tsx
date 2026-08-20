import RefreshFakeEngagementButton from '@/components/refresh-fake-engagement-button'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/not-authorized') // or just '/'
  }

  return (
    <main className='space-y-6 p-8'>
      <div>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        <p className='mt-4 text-gray-600'>Welcome, {user.email}</p>
      </div>
      <section className='space-y-3 border border-border p-5'>
        <h2 className='text-lg font-semibold'>Article engagement</h2>
        <p className='text-sm text-muted-foreground'>
          Recalculate fake views and likes for every post using its creation date and the current
          time.
        </p>
        <RefreshFakeEngagementButton />
      </section>
    </main>
  )
}
