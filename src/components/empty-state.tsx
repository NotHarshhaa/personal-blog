'use client'

import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { Frame, FrameBody } from '@/components/frame'

type EmptyStateProps = {
  title?: string
  description?: string
  actionText?: string
  actionHref?: string
  icon?: React.ReactNode
  showAction?: boolean
}

const EmptyState = ({
  title = 'No posts yet',
  description = 'Be the first to share your thoughts and experiences.',
  actionText = 'Create Post',
  actionHref = '/editor',
  icon,
  showAction = true
}: EmptyStateProps) => {
  return (
    <Frame>
      <FrameBody className="flex flex-col items-center justify-center py-16 text-center">
        <span className="mb-5 flex size-14 items-center justify-center border border-border bg-background">
          {icon || <FileText className="size-6 text-muted-foreground" />}
        </span>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        {showAction && (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center gap-2 border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            <Plus className="size-4" />
            {actionText}
          </Link>
        )}
      </FrameBody>
    </Frame>
  )
}

export default EmptyState
