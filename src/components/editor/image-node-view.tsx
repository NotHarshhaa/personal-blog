'use client'

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { ArrowLeft, ExternalLink, Maximize2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/utils'

export const ImageNodeView = (props: ReactNodeViewProps) => {
  const { node, updateAttributes, editor } = props
  const src = (node.attrs.src as string) || ''
  const alt = (node.attrs.alt as string) || ''
  const title = (node.attrs.title as string) || ''
  const caption = title || alt

  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isEditable = editor.isEditable

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle ESC key to close lightbox and lock body scroll while open
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false)
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    globalThis.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      globalThis.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLightboxOpen])

  if (!src) {
    return null
  }

  const renderCaption = () => {
    if (caption) {
      return (
        <figcaption className='mt-2.5 max-w-3xl px-2 text-center font-sans text-xs italic leading-relaxed text-muted-foreground sm:text-sm'>
          {caption}
        </figcaption>
      )
    }
    if (isEditable) {
      return (
        <div className='mt-2'>
          <input
            type='text'
            placeholder='Add caption below image...'
            defaultValue=''
            onBlur={(e) => {
              const val = e.target.value.trim()
              if (val) {
                updateAttributes({ title: val })
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
            className='border-dashed border-border/60 bg-transparent px-2 py-0.5 text-center font-sans text-xs italic text-muted-foreground placeholder:text-muted-foreground/40 focus:border-solid focus:outline-none'
          />
        </div>
      )
    }
    return null
  }

  return (
    <NodeViewWrapper className='image-node-view-wrapper not-prose my-6 w-full'>
      <figure className='group relative mx-auto flex flex-col items-center justify-center text-center'>
        {/* Main Image with rounded corners and click-to-expand */}
        <button
          type='button'
          aria-label='View image full size'
          onClick={() => setIsLightboxOpen(true)}
          className={cn(
            'group/img relative inline-block max-w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/80 bg-black/90 p-0 shadow-sm transition-all duration-300',
            'hover:border-foreground/50 hover:shadow-md focus:outline-none'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered inside dynamic ProseMirror node view */}
          <img
            src={src}
            alt={alt || caption || 'Blog image'}
            className='block max-h-[550px] w-auto max-w-full rounded-2xl object-contain transition-transform duration-300 group-hover/img:scale-[1.01]'
            loading='lazy'
          />

          {/* Hover overlay hint */}
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover/img:opacity-100'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 font-mono text-[11px] font-medium text-white shadow-lg backdrop-blur-sm'>
              <Maximize2 className='size-3.5' />
              <span>Click to expand</span>
            </span>
          </div>
        </button>

        {/* Caption below image with rounded-style typography */}
        {renderCaption()}
      </figure>

      {/* Lightbox Fullscreen View (Image 2 style) */}
      {isLightboxOpen && mounted &&
        createPortal(
          <div
            role='dialog'
            aria-modal='true'
            aria-label={caption || 'Fullscreen image preview'}
            className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in-0 duration-200 select-none'
          >
            {/* Backdrop click to close */}
            <button
              type='button'
              className='absolute inset-0 size-full cursor-default border-0 bg-transparent'
              onClick={() => setIsLightboxOpen(false)}
              aria-label='Close fullscreen preview'
              tabIndex={-1}
            />

            {/* Top Bar with Back Arrow */}
            <header className='absolute top-4 left-4 z-20 flex items-center gap-3'>
              <button
                type='button'
                onClick={() => setIsLightboxOpen(false)}
                className='flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95'
                aria-label='Close fullscreen preview'
                title='Close (Esc)'
              >
                <ArrowLeft className='size-5' />
              </button>
            </header>

            {/* Top Right Close & Open in new tab controls */}
            <div className='absolute top-4 right-4 z-20 flex items-center gap-2'>
              <a
                href={src}
                target='_blank'
                rel='noopener noreferrer'
                className='flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20'
                title='Open original in new tab'
                aria-label='Open original in new tab'
              >
                <ExternalLink className='size-4' />
              </a>
              <button
                type='button'
                onClick={() => setIsLightboxOpen(false)}
                className='flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95'
                aria-label='Close'
                title='Close'
              >
                <X className='size-5' />
              </button>
            </div>

            {/* Centered Image display */}
            <div className='relative z-10 flex max-h-[85vh] max-w-[95vw] items-center justify-center p-2 pointer-events-none'>
              {/* eslint-disable-next-line @next/next/no-img-element -- rendered inside dynamic ProseMirror node view */}
              <img
                src={src}
                alt={alt || caption || 'Expanded preview'}
                className='max-h-[82vh] max-w-[94vw] object-contain rounded-lg shadow-2xl pointer-events-auto'
              />
            </div>

            {/* Bottom Caption Bar */}
            {caption && (
              <footer className='pointer-events-none absolute bottom-5 left-6 right-6 z-20 text-left'>
                <p className='max-w-4xl font-mono text-xs text-neutral-300 drop-shadow-md sm:text-sm italic'>
                  {caption}
                </p>
              </footer>
            )}
          </div>,
          document.body
        )}
    </NodeViewWrapper>
  )
}
