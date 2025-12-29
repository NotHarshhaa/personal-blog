import { range } from '@/utils'
import { Suspense } from 'react'
import { BookOpen, Sparkles } from 'lucide-react'

import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'

const HomePage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="mb-12 sm:mb-16 md:mb-20">
        <div className="flex flex-col items-start gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="size-6 sm:size-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Welcome to
                <span className="block mt-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  DevOps & Cloud Space
                </span>
              </h1>
            </div>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Discover hands-on tutorials, real-world engineering insights, and tools like Kubernetes, Terraform, Docker, and AWS.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            <span>Sharing DevOps & Cloud knowledge with the community</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-8 sm:mb-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
        <div className="rounded-full bg-border/50 p-1.5">
          <BookOpen className="size-3 text-muted-foreground" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
      </div>

      {/* Posts Section */}
      <Suspense
        fallback={
          <div className="space-y-4 sm:space-y-6">
            {(range(10) as number[]).map((i) => (
              <PostsPlaceholder key={i} />
            ))}
          </div>
        }
      >
        <Posts />
      </Suspense>
    </div>
  )
}

export default HomePage
