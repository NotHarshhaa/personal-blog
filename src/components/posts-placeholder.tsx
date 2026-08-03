import { Skeleton } from '@/components/ui/skeleton'

const PostsPlaceholder = () => (
  <div className="space-y-3 px-4 py-5 sm:px-5 sm:py-6">
    <div className="flex items-center gap-2.5">
      <Skeleton className="size-7" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-6 w-3/4 max-w-md" />
    <Skeleton className="h-12 w-full max-w-lg" />
    <Skeleton className="mt-2 h-4 w-16" />
  </div>
)

export default PostsPlaceholder
