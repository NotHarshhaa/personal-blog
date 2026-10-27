'use client'

import {
  ArrowUpRightIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  TagIcon,
  XIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { type ChangeEvent, type KeyboardEvent, useEffect, useMemo, useState } from 'react'

import { updatePostAction } from '@/actions/update-post-action'
import Editor from '@/components/editor'
import { Frame, FrameBody, StripHeader } from '@/components/frame'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  toast
} from '@/components/ui'
import { type Post, Visibility } from '@/db/schema'
import { SITE_TOPICS } from '@/lib/constants'
import { cn } from '@/utils'
import { capitalize } from '@/utils/capitalize'

const LivePreview = ({ content }: { content: string }) => (
  <div className='LivePreview border-border bg-background mx-auto max-w-none border p-4 sm:p-6 md:p-8'>
    <Editor
      options={{ content, editable: false }}
      showToolbar={false}
      showStats={false}
      showBubbleMenu={false}
    />
  </div>
)

type FormProps = {
  post: Post
}

const Form = (props: FormProps) => {
  const { post } = props
  const [title, setTitle] = useState(post.title)
  const [description, setDescription] = useState(post.description)
  const [content, setContent] = useState(post.content)
  const [tags, setTags] = useState<string[]>(post.tags)
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<Visibility>(post.visibility as Visibility)
  const [isOpen, setIsOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()
  const action = useAction(updatePostAction, {
    onSuccess: ({ input }) => {
      if (input.visibility) {
        toast.success(`Visibility set to ${input.visibility}`)
        setIsOpen(false)
        return
      }
      if (input.published) {
        toast.success('Post published')
        router.push(`/posts/${post.id}`)
        return
      }
      toast.success('Post saved')
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'An error occurred')
    }
  })

  const isDirty = useMemo(
    () =>
      title !== post.title ||
      (description ?? '') !== (post.description ?? '') ||
      content !== post.content ||
      JSON.stringify(tags) !== JSON.stringify(post.tags),
    [title, description, content, tags, post]
  )

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '')
    if (!trimmed) return
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return
    setTags((prev) => [...prev, trimmed])
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const handleUpdatePost = async (published = false) => {
    await action.executeAsync({
      postId: post.id,
      title,
      content,
      description,
      tags,
      published
    })
  }

  const handleVisibilityChange = async () => {
    await action.executeAsync({
      postId: post.id,
      visibility
    })
  }

  // Ctrl/Cmd + S saves in place (keeps current publish state)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (!action.isExecuting) {
          void handleUpdatePost(post.published)
        }
      }
    }
    globalThis.addEventListener('keydown', handleKeyDown)
    return () => globalThis.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-bind only when executing state changes
  }, [action.isExecuting, post.published, title, description, content, tags])

  return (
    <div className='relative z-10 w-full'>
      <Frame>
        <StripHeader
          left={
            <>
              <span className='truncate'>DOC // {post.id.slice(0, 8)}</span>
              {post.published ? (
                <span className='bg-foreground text-background px-1.5 py-px text-[8px] font-semibold'>
                  Live
                </span>
              ) : (
                <span className='border-muted-foreground/50 border border-dashed px-1.5 py-px text-[8px] font-semibold'>
                  Draft
                </span>
              )}
              {isDirty && (
                <span
                  className='inline-flex items-center gap-1 text-amber-600 dark:text-amber-400'
                  aria-label='You have unsaved changes'
                >
                  <span className='relative flex size-1.5'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75' />
                    <span className='relative inline-flex size-1.5 rounded-full bg-amber-500' />
                  </span>
                  Unsaved changes
                </span>
              )}
            </>
          }
          right={
            post.published ? (
              <Link
                href={`/posts/${post.id}`}
                className='hover:text-foreground inline-flex items-center gap-1 transition-colors'
              >
                <span>View post</span>
                <ArrowUpRightIcon className='size-2.5' aria-hidden />
              </Link>
            ) : (
              <span>Editor</span>
            )
          }
        />

        <FrameBody className='space-y-0 p-0'>
          {/* Meta: title, description, visibility */}
          <div className='space-y-4 p-5'>
            <div className='flex items-start justify-between gap-3'>
              <p className='text-muted-foreground pt-1.5 font-mono text-[10px] font-semibold tracking-widest uppercase'>
                {'// 01: Meta'}
              </p>
              {post.published && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <button
                      type='button'
                      className='border-border bg-background text-foreground hover:border-foreground inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 border px-2.5 font-mono text-[10px] font-semibold tracking-wider uppercase transition-colors'
                      aria-label='Change post visibility'
                    >
                      {visibility === Visibility.Public ? (
                        <GlobeIcon className='size-3' aria-hidden />
                      ) : (
                        <LockIcon className='size-3' aria-hidden />
                      )}
                      {capitalize(visibility)}
                    </button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Change visibility</DialogTitle>
                      <DialogDescription>
                        Keep this post private or make it publicly accessible.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-2'>
                      <Label htmlFor='visibility' className='text-sm font-medium'>
                        Visibility
                      </Label>
                      <Select
                        value={visibility}
                        onValueChange={(value: unknown) => {
                          const strValue = value as string
                          if (
                            strValue === (Visibility.Public as string) ||
                            strValue === (Visibility.Private as string)
                          ) {
                            setVisibility(strValue as Visibility)
                          }
                        }}
                      >
                        <SelectTrigger id='visibility' className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Visibility.Public}>
                            <div className='flex items-center gap-2'>
                              <GlobeIcon className='size-4' />
                              <span>Public</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={Visibility.Private}>
                            <div className='flex items-center gap-2'>
                              <LockIcon className='size-4' />
                              <span>Private</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={action.isExecuting}
                        onClick={handleVisibilityChange}
                        className='w-full cursor-pointer sm:w-auto'
                      >
                        {action.isExecuting ? (
                          <Loader2Icon className='mr-2 size-4 animate-spin' />
                        ) : null}
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Title — styled like the article h1 it becomes */}
            <div>
              <Label htmlFor='title' className='sr-only'>
                Title
              </Label>
              <Input
                type='text'
                id='title'
                placeholder='Post title...'
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setTitle(e.target.value)
                }}
                className='font-heading text-foreground placeholder:text-muted-foreground/40 focus-visible:border-foreground/30 h-auto border-0 border-b border-transparent bg-transparent px-0 text-2xl font-semibold tracking-tight focus-visible:ring-0 sm:text-3xl'
                aria-label='Post title'
              />
            </div>
            <div>
              <Label htmlFor='description' className='sr-only'>
                Description
              </Label>
              <Textarea
                placeholder='Brief description shown on cards, previews, and search results...'
                id='description'
                rows={2}
                value={description ?? ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value)
                }}
                className='text-muted-foreground resize-none border-0 bg-transparent px-0 text-sm leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0'
                aria-label='Post description'
              />
            </div>
          </div>

          <div className='bg-border h-px w-full' role='separator' />

          {/* Tags & Topics */}
          <div className='space-y-3 p-5'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest uppercase'>
                <TagIcon className='size-3' aria-hidden />
                {'// 02: Topics & tags'}
              </p>
              <span className='text-muted-foreground font-mono text-[10px]'>
                {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
              </span>
            </div>

            {/* Current Tags */}
            <div className='flex flex-wrap items-center gap-1.5'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='border-border bg-background text-foreground inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-xs font-medium'
                >
                  #{tag}
                  <button
                    type='button'
                    onClick={() => handleRemoveTag(tag)}
                    className='text-muted-foreground hover:text-destructive cursor-pointer transition-colors'
                    title={`Remove ${tag}`}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <XIcon className='size-3' />
                  </button>
                </span>
              ))}

              {/* Tag Input */}
              <div className='flex items-center gap-1'>
                <Input
                  id='post-tags'
                  type='text'
                  placeholder='Add tag (press Enter)...'
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className='h-8 max-w-[220px] font-mono text-xs'
                />
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim()}
                  className='h-8 cursor-pointer px-2 text-xs'
                >
                  <PlusIcon className='size-3.5' aria-hidden />
                  <span className='sr-only'>Add tag</span>
                </Button>
              </div>
            </div>

            {/* Quick Suggestions from SITE_TOPICS */}
            <div className='pt-1'>
              <p className='text-muted-foreground mb-1.5 font-mono text-[10px] tracking-widest uppercase'>
                Quick topic presets
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {SITE_TOPICS.map((topic) => {
                  const isSelected = tags.some((t) => t.toLowerCase() === topic.toLowerCase())
                  return (
                    <button
                      key={topic}
                      type='button'
                      onClick={() => (isSelected ? handleRemoveTag(topic) : handleAddTag(topic))}
                      className={cn(
                        'hover-fill inline-flex cursor-pointer items-center gap-1 border px-2 py-0.5 font-mono text-[11px] transition-colors',
                        isSelected
                          ? 'border-foreground bg-foreground text-background font-medium'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                      )}
                      aria-pressed={isSelected}
                    >
                      <span className={cn(!isSelected && 'text-muted-foreground/50')}>
                        {isSelected ? '✓' : '+'}
                      </span>
                      <span>{topic}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className='bg-border h-px w-full' role='separator' />

          {/* Content */}
          <div>
            <div className='border-border bg-muted/20 flex flex-col justify-between gap-2 border-b px-5 py-3 sm:flex-row sm:items-center'>
              <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
                {'// 03: Content'}
              </p>
              <div className='flex items-center gap-2.5'>
                <Switch
                  id='preview-toggle'
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                  aria-label='Toggle live preview'
                />
                <Label
                  htmlFor='preview-toggle'
                  className='inline-flex cursor-pointer items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase select-none'
                >
                  {showPreview ? (
                    <EyeIcon className='size-3' aria-hidden />
                  ) : (
                    <EyeOffIcon className='size-3' aria-hidden />
                  )}
                  {showPreview ? 'Previewing' : 'Preview'}
                </Label>
              </div>
            </div>

            <div className='bg-background'>
              {showPreview ? (
                <LivePreview content={content ?? ''} />
              ) : (
                <Editor
                  options={{ content }}
                  onChange={(editor) => {
                    setContent(editor.getHTML())
                  }}
                  onMetadataExtracted={({
                    title: extractedTitle,
                    description: extractedDescription
                  }) => {
                    if (extractedTitle) {
                      setTitle(extractedTitle)
                    }
                    if (extractedDescription) {
                      setDescription(extractedDescription)
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Sticky Action Bar */}
          <div className='border-border bg-card/95 sticky bottom-0 z-10 mt-0 flex flex-col-reverse items-stretch justify-between gap-2 border-t px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:gap-3'>
            <p className='text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase'>
              <kbd className='border-border bg-muted text-foreground border px-1 py-0.5 font-mono text-[9px]'>
                Ctrl+S
              </kbd>
              <span>to save in place</span>
            </p>
            <div
              className={cn(
                'flex items-center gap-2',
                !post.published && 'justify-between sm:justify-end'
              )}
            >
              {!post.published && (
                <Button
                  onClick={() => handleUpdatePost()}
                  disabled={action.isExecuting}
                  variant='outline'
                  className='cursor-pointer'
                >
                  {action.isExecuting && <Loader2Icon className='mr-2 size-4 animate-spin' />}
                  Save as draft
                </Button>
              )}
              <Button
                onClick={() => handleUpdatePost(true)}
                disabled={action.isExecuting}
                className='cursor-pointer'
              >
                {action.isExecuting && <Loader2Icon className='mr-2 size-4 animate-spin' />}
                {post.published ? 'Update post' : 'Publish post'}
              </Button>
            </div>
          </div>
        </FrameBody>
      </Frame>
    </div>
  )
}

export default Form
