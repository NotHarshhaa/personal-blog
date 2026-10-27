import { Frame } from '@/components/frame'
import { range } from '@/utils'

const SnippetsPlaceholder = () => (
  <Frame>
    <div className='divide-border divide-y'>
      {range(4).map((i) => (
        <div key={i} className='animate-pulse space-y-3 px-4 py-5 sm:px-5'>
          <div className='flex items-center justify-between gap-3'>
            <div className='bg-muted h-4 w-24' />
            <div className='bg-muted h-6 w-28' />
          </div>
          <div className='bg-muted h-5 w-2/3' />
          <div className='bg-muted/60 h-28 w-full' />
        </div>
      ))}
    </div>
  </Frame>
)

export default SnippetsPlaceholder
