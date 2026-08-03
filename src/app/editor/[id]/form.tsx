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
} from '@/components/ui'
import { cn } from '@/utils'
import {
  GlobeIcon,
  Loader2Icon,
  LockIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { type ChangeEvent, useState } from 'react'

import { updatePostAction } from '@/actions/update-post-action'
import Editor from '@/components/editor'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { type Post, Visibility } from '@/db/schema'
import { capitalize } from '@/utils/capitalize'

const LivePreview = ({ content }: { content: string }) => (
  <div className="prose LivePreview dark:prose-invert mx-auto max-w-none border border-border bg-background p-4 sm:p-6 md:p-8">
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
  const [visibility, setVisibility] = useState<Visibility>(
    post.visibility as Visibility
  )
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
    <div className="relative z-10 w-full">
      <Frame>
        <FrameHeader label="Editor">
          {post.published && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {visibility === Visibility.Public ? (
                    <GlobeIcon className="mr-2 size-4" />
                  ) : (
                    <LockIcon className="mr-2 size-4" />
                  )}
                  {capitalize(visibility)}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change visibility</DialogTitle>
                  <DialogDescription>
                    Keep this post private or make it publicly accessible.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-sm font-medium">
                    Visibility
                  </Label>
                  <Select
                    value={visibility ?? Visibility.Public}
                    onValueChange={(value: string) => {
                      if (
                        value === Visibility.Public ||
                        value === Visibility.Private
                      ) {
                        setVisibility(value)
                      }
                    }}
                  >
                    <SelectTrigger id="visibility" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Visibility.Public}>
                        <div className="flex items-center gap-2">
                          <GlobeIcon className="size-4" />
                          <span>Public</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={Visibility.Private}>
                        <div className="flex items-center gap-2">
                          <LockIcon className="size-4" />
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
                    className="w-full sm:w-auto"
                  >
                    {action.isExecuting ? (
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </FrameHeader>
        <FrameBody className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Edit Post
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Craft your content with the editor
            </p>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                placeholder="Enter your post title"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setTitle(e.target.value)
                }}
                className="h-10 text-base sm:h-12 sm:text-lg"
                aria-label="Post title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                placeholder="Brief description of your post"
                id="description"
                value={description ?? ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value)
                }}
                className="min-h-[2.5rem] resize-none sm:min-h-[3rem]"
                aria-label="Post description"
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Write your post content using markdown
                </p>
              </div>
              <div className="flex items-center gap-3 self-end border border-border px-3 py-2 sm:self-auto">
                <Switch
                  id="preview-toggle"
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                  aria-label="Toggle live preview"
                />
                <Label
                  htmlFor="preview-toggle"
                  className="cursor-pointer text-sm select-none"
                >
                  Preview
                  {showPreview ? (
                    <EyeIcon className="ml-2 inline-block size-4" />
                  ) : (
                    <EyeOffIcon className="ml-2 inline-block size-4 text-muted-foreground" />
                  )}
                </Label>
              </div>
            </div>

            <div className="overflow-hidden border border-border bg-background">
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

          <div
            className={cn(
              'sticky bottom-0 z-10 mt-2 flex flex-col-reverse gap-2 border border-border bg-card/95 p-3 backdrop-blur-sm sm:mt-4 sm:flex-row sm:gap-3 sm:p-4',
              post.published ? 'justify-end' : 'justify-between'
            )}
          >
            {!post.published && (
              <Button
                onClick={() => handleUpdatePost()}
                disabled={action.isExecuting}
                variant="outline"
              >
                {action.isExecuting && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                Save as draft
              </Button>
            )}
            <Button
              onClick={() => handleUpdatePost(true)}
              disabled={action.isExecuting}
            >
              {action.isExecuting && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              {post.published ? 'Update post' : 'Publish post'}
            </Button>
          </div>
        </FrameBody>
      </Frame>
    </div>
  )
}

export default Form
