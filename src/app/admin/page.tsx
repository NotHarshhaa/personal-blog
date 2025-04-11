// app/admin/page.tsx

import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/not-authorized') // or just '/'
  }

  return (
    <main className='p-8'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
      <p className='mt-4 text-gray-600'>Welcome, {user.email}</p>
    </main>
  )
}
