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
import { type ChangeEvent, useState } from 'react'

import { updatePostAction } from '@/actions/update-post-action'
import Editor from '@/components/editor'
import { type Post, Visibility } from '@/db/schema'
import { capitalize } from '@/utils/capitalize'

// Update the LivePreview component with better styling
const LivePreview = ({ content }: { content: string }) => (
  <div className='prose dark:prose-invert mx-auto max-w-none rounded-xl border border-border/40 bg-background/70 p-4 sm:p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl LivePreview'>
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
      toast.error(error.serverError ?? 'An error occurred')
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
    <div className="mx-auto w-full max-w-3xl md:max-w-5xl lg:max-w-7xl xl:max-w-[100rem] 2xl:max-w-[120rem] px-2 sm:px-4 md:px-6 lg:px-8">
      <div className='rounded-2xl border border-border/40 bg-white/90 backdrop-blur-sm p-3 sm:p-6 md:p-8 lg:p-10 shadow-xl dark:bg-zinc-900/90 dark:shadow-2xl transition-all duration-300 hover:shadow-2xl dark:hover:shadow-3xl'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-8'>
          <div className='space-y-0.5 sm:space-y-1'>
            <h2 className='text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent'>Edit Post</h2>
            <p className='text-xs sm:text-sm text-muted-foreground'>Craft your content with our enhanced editor</p>
          </div>
          {post.published && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' className='text-xs sm:text-sm shadow-sm transition-all duration-300 hover:shadow-md px-2 sm:px-3 py-1 sm:py-2 h-auto'>
                  {visibility === Visibility.Public ? (
                    <GlobeIcon className='mr-1 sm:mr-2 size-3 sm:size-4' />
                  ) : (
                    <LockIcon className='mr-1 sm:mr-2 size-3 sm:size-4' />
                  )}
                  {capitalize(visibility)}
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Change visibility</DialogTitle>
                  <DialogDescription>
                    Keep this post private or make it publicly accessible.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-2'>
                  <Label htmlFor='visibility' className='text-sm font-medium'>Visibility</Label>
                  <Select
                    value={visibility ?? Visibility.Public}
                    onValueChange={(value: string) => {
                      if (value === Visibility.Public || value === Visibility.Private) {
                        setVisibility(value)
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
                  <Button disabled={action.isExecuting} onClick={handleVisibilityChange} className='w-full sm:w-auto'>
                    {action.isExecuting ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : null}
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Separator className='mb-4 sm:mb-8' />
        <div className='space-y-4 sm:space-y-8'>
          <div className='grid gap-4 sm:gap-8 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='title' className='text-sm font-medium'>Title</Label>
              <Input
                type='text'
                id='title'
                placeholder='Enter your post title'
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setTitle(e.target.value)
                }}
                className='h-10 sm:h-12 text-base sm:text-lg transition-shadow duration-300 hover:shadow-md focus:shadow-md'
                aria-label='Post title'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description' className='text-sm font-medium'>Description</Label>
              <Textarea
                placeholder='Brief description of your post'
                id='description'
                value={description ?? ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value)
                }}
                className='min-h-[2.5rem] sm:min-h-[3rem] transition-shadow duration-300 hover:shadow-md focus:shadow-md resize-none'
                aria-label='Post description'
              />
            </div>
          </div>

          <div className='space-y-2 sm:space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0'>
              <div className='space-y-0.5 sm:space-y-1'>
                <Label className='text-xs sm:text-sm font-medium'>Content</Label>
                <p className='text-xs text-muted-foreground hidden sm:block'>Write your post content using markdown</p>
              </div>
              <div className='flex items-center gap-2 sm:gap-3 bg-muted/30 rounded-lg px-2 sm:px-4 py-1 sm:py-2 self-end sm:self-auto'>
                <Switch
                  id='preview-toggle'
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                  className='data-[state=checked]:bg-primary'
                  aria-label='Toggle live preview'
                />
                <Label htmlFor='preview-toggle' className='text-xs sm:text-sm cursor-pointer select-none'>
                  Preview
                  {showPreview ?
                    <EyeIcon className='inline-block ml-1 sm:ml-2 size-3 sm:size-4 text-primary' /> :
                    <EyeOffIcon className='inline-block ml-1 sm:ml-2 size-3 sm:size-4 text-muted-foreground' />
                  }
                </Label>
              </div>
            </div>

            <div className='rounded-xl border border-border/40 bg-background/50 transition-all duration-300 hover:shadow-lg overflow-hidden'>
              {!showPreview ? (
                <Editor
                  options={{ content }}
                  onChange={(editor) => {
                    setContent(editor.getHTML())
                  }}
                />
              ) : (
                <LivePreview content={content ?? ''} />
              )}
            </div>
          </div>
        </div>

        <div className={cn(
          'sticky bottom-0 mt-4 sm:mt-8 flex flex-col-reverse gap-2 sm:gap-3 sm:flex-row',
          post.published ? 'justify-end' : 'justify-between',
          'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-2 sm:p-4 rounded-xl border border-border/40 shadow-lg z-10'
        )}>
          {!post.published && (
            <Button
              onClick={() => handleUpdatePost()}
              disabled={action.isExecuting}
              variant='outline'
              className='transition-all duration-300 hover:shadow-md text-xs sm:text-sm h-9 sm:h-10'
            >
              {action.isExecuting && <Loader2Icon className='mr-1 sm:mr-2 size-3 sm:size-4 animate-spin' />}
              Save as draft
            </Button>
          )}
          <Button
            onClick={() => handleUpdatePost(true)}
            disabled={action.isExecuting}
            className='bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-md text-xs sm:text-sm h-9 sm:h-10'
          >
            {action.isExecuting && <Loader2Icon className='mr-1 sm:mr-2 size-3 sm:size-4 animate-spin' />}
            {post.published ? 'Update post' : 'Publish post'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Form
