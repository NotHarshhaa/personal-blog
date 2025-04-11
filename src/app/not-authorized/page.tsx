// app/not-authorized/page.tsx

export default function NotAuthorized() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center text-center'>
      <h1 className='text-4xl font-bold'>403 - Not Authorized</h1>
      <p className='mt-4 text-gray-500'>You do not have permission to view this page.</p>
    </div>
  )
}
