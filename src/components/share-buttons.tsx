'use client'

import { Button, buttonVariants } from '@/components/ui'
import { Copy, Share2, Twitter, Linkedin, Facebook } from 'lucide-react'
import { copyUrl } from '@/utils/copy-url'
import { SITE_URL } from '@/lib/constants'
import { cn } from '@/utils'

type ShareButtonsProps = {
  title: string
  description?: string
  postId: string
  className?: string
}

const ShareButtons = ({ title, description, postId, className }: ShareButtonsProps) => {
  const postUrl = `${SITE_URL}/posts/${postId}`
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || '')
  const encodedUrl = encodeURIComponent(postUrl)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: postUrl
        })
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      // Fallback to copy
      await copyUrl(postUrl)
    }
  }

  const handleCopy = async () => {
    await copyUrl(postUrl)
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2"
        aria-label="Share post"
      >
        <Share2 className="size-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-2"
        aria-label="Copy link"
      >
        <Copy className="size-4" />
        <span className="hidden sm:inline">Copy</span>
      </Button>

      <div className="flex items-center gap-1">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-9 w-9 p-0 flex items-center justify-center'
          )}
          aria-label="Share on Twitter"
        >
          <Twitter className="size-4" />
        </a>

        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-9 w-9 p-0 flex items-center justify-center'
          )}
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="size-4" />
        </a>

        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-9 w-9 p-0 flex items-center justify-center'
          )}
          aria-label="Share on Facebook"
        >
          <Facebook className="size-4" />
        </a>
      </div>
    </div>
  )
}

export default ShareButtons

