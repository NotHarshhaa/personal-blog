'use client'

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
  Textarea,
  toast,
  Separator,
  Switch
} from '@tszhong0411/ui'
import { cn } from '@tszhong0411/utils'
import { GlobeIcon, Loader2Icon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { updatePostAction } from '@/actions/update-post-action'
import Editor from '@/components/editor'
import { type Post, Visibility } from '@/db/schema'
import { capitalize } from '@/utils/capitalize'

// Simple live preview component
const LivePreview = ({ content }: { content: string }) => (
  <div className='prose dark:prose-invert mx-auto max-w-none rounded-xl border bg-background/70 p-6 shadow-inner'>
    <div dangerouslySetInnerHTML={{ __html: content }} />
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
      toast.error(error.serverError)
    }
  })

  const handleUpdatePost = async (published = false) => {
    await action.executeAsync({
      postId: post.id,
      title,
      content,
      description,
      published
    })
  }

  const handleVisibilityChange = async () => {
    await action.executeAsync({
      postId: post.id,
      visibility
    })
  }

  return (
    <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl rounded-2xl border border-border/40 bg-white/90 p-4 md:p-8 shadow-lg dark:bg-zinc-900/90">
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold tracking-tight'>Edit Post</h2>
        {post.published && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant='outline'>
                {visibility === Visibility.Public ? (
                  <GlobeIcon className='mr-2 size-4' />
                ) : (
                  <LockIcon className='mr-2 size-4' />
                )}
                {capitalize(visibility)}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change visibility</DialogTitle>
                <DialogDescription>
                  Keep this post private or make it publicly accessible.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-1.5'>
                <Label htmlFor='visibility'>Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(value) => {
                    setVisibility(value as Visibility)
                  }}
                >
                  <SelectTrigger id='visibility' className='w-[180px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Visibility.Public}>Public</SelectItem>
                    <SelectItem value={Visibility.Private}>Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button disabled={action.isExecuting} onClick={handleVisibilityChange}>
                  {action.isExecuting ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : null}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Separator className='mb-6' />
      <div className='my-8 space-y-6'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='title'>Title</Label>
          <Input
            type='text'
            id='title'
            placeholder='Title'
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
            }}
            aria-label='Post title'
          />
        </div>
        <div className='flex w-full flex-col gap-1.5'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            placeholder='Description'
            id='description'
            value={description ?? ''}
            onChange={(e) => {
              setDescription(e.target.value)
            }}
            aria-label='Post description'
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label className='font-semibold'>Content</Label>
          <div className='flex items-center gap-2'>
            <Switch
              id='preview-toggle'
              checked={showPreview}
              onCheckedChange={setShowPreview}
              aria-label='Toggle live preview'
            />
            <span className='text-xs text-muted-foreground'>Live Preview</span>
            {showPreview ? <EyeIcon className='size-4 text-primary' /> : <EyeOffIcon className='size-4 text-muted-foreground' />}
          </div>
        </div>
        {!showPreview ? (
          <Editor
            options={{ content }}
            onChange={(editor) => {
              setContent(editor.getHTML())
            }}
          />
        ) : (
          <LivePreview content={content} />
        )}
        <Separator className='my-6' />
        <div className={cn('flex flex-col-reverse gap-2 sm:flex-row', post.published ? 'justify-end' : 'justify-between') + ' sticky bottom-0 bg-white/80 dark:bg-zinc-900/80 p-4 rounded-b-2xl z-10 shadow-sm'}>
          {!post.published && (
            <Button onClick={() => handleUpdatePost()} disabled={action.isExecuting} variant='outline'>
              {action.isExecuting && <Loader2Icon className='mr-2 size-4 animate-spin' />}
              Save as draft
            </Button>
          )}
          <Button onClick={() => handleUpdatePost(true)} disabled={action.isExecuting}>
            {action.isExecuting && <Loader2Icon className='mr-2 size-4 animate-spin' />}
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Form
