'use client'

import type { User } from '@/db/schema'
import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  toast
} from '@/components/ui'
import {
  Loader2Icon,
  UserIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useForm, useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { updateUserSchema } from '@/actions/schema'
import { updateUserAction } from '@/actions/update-user-action'

type SettingsFormProps = {
  user: User
}

const themeOptions = [
  { value: 'system', label: 'System', icon: <MonitorIcon className="size-4" /> },
  { value: 'light', label: 'Light', icon: <SunIcon className="size-4" /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon className="size-4" /> }
]

const SettingsForm = (props: SettingsFormProps) => {
  const { user } = props
  const { name, image, bio } = user
  const router = useRouter()
  const { setTheme } = useTheme()
  const action = useAction(updateUserAction, {
    onSuccess: () => {
      toast.success('Settings saved')
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ??
          error.validationErrors?.name?.[0] ??
          error.validationErrors?.image?.[0] ??
          error.validationErrors?.bio?.[0]
      )
    }
  })

  const form = useForm<
    z.infer<typeof updateUserSchema> & {
      github?: string
      twitter?: string
      linkedin?: string
      theme?: string
    }
  >({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: name,
      image: image ?? '',
      bio: bio ?? '',
      github: '',
      twitter: '',
      linkedin: '',
      theme: 'system'
    }
  })

  const preview = useWatch({ control: form.control })

  const onSubmit = async (
    values: z.infer<typeof updateUserSchema> & {
      github?: string
      twitter?: string
      linkedin?: string
      theme?: string
    }
  ) => {
    await action.executeAsync(values)
  }

  return (
    <Frame>
      <FrameHeader label="Profile" />
      <FrameBody>
        <Form {...form}>
          <form
            className="space-y-8"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="size-20 border border-border sm:size-24">
                  <AvatarImage
                    src={preview.image || image || ''}
                    width={96}
                    height={96}
                    alt={preview.name || name}
                  />
                  <AvatarFallback className="bg-muted">
                    <UserIcon className="size-8 text-muted-foreground sm:size-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="text-base font-semibold sm:text-lg">
                    {preview.name || name}
                  </div>
                  <div className="mt-1 max-w-xs text-xs text-muted-foreground sm:text-sm">
                    {preview.bio || bio || 'No bio yet.'}
                  </div>
                </div>
              </div>
              <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          id="name"
                          placeholder="Your name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Avatar Image URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          id="image"
                          placeholder="https://example.com/avatar.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-semibold">Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Social Links
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:gap-6">
              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Github className="size-4" />
                      GitHub
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        id="github"
                        placeholder="https://github.com/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Twitter className="size-4" />
                      Twitter
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        id="twitter"
                        placeholder="https://twitter.com/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Linkedin className="size-4" />
                      LinkedIn
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        id="linkedin"
                        placeholder="https://linkedin.com/in/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Appearance
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Theme Preference
                  </FormLabel>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {themeOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={
                          field.value === opt.value ? 'default' : 'outline'
                        }
                        onClick={() => {
                          field.onChange(opt.value)
                          setTheme(opt.value)
                        }}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5',
                          field.value === opt.value && 'ring-1 ring-foreground/20'
                        )}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" disabled={action.isExecuting} size="lg">
                {action.isExecuting && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </FrameBody>
    </Frame>
  )
}

export default SettingsForm
