'use client'

import type { User } from '@/db/schema'
import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  GitBranch,
  LinkIcon,
  Loader2Icon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useTheme } from 'next-themes'
import { useForm, useWatch } from 'react-hook-form'

import { updateUserSchema } from '@/actions/schema'
import { updateUserAction } from '@/actions/update-user-action'
import { CornerBrackets, Frame, StripHeader } from '@/components/frame'
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
import { cn } from '@/lib/utils'

type SettingsFormProps = {
  user: User
}

const themeOptions = [
  { value: 'system', label: 'System', icon: <MonitorIcon className='size-3.5' /> },
  { value: 'light', label: 'Light', icon: <SunIcon className='size-3.5' /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon className='size-3.5' /> }
]

type SettingsFormValues = z.infer<typeof updateUserSchema>

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

  const form = useForm<SettingsFormValues>({
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
  const isDirty = form.formState.isDirty

  // Empty strings in the form fall through to the saved profile values
  const displayImage =
    preview.image != null && preview.image.length > 0 ? preview.image : (image ?? '')
  const displayName = preview.name != null && preview.name.length > 0 ? preview.name : name
  const displayBio = preview.bio != null && preview.bio.length > 0 ? preview.bio : (bio ?? '')

  const onSubmit = async (values: SettingsFormValues) => {
    await action.executeAsync(values)
  }

  return (
    <Frame>
      <StripHeader
        left={
          <span className='text-foreground font-semibold'>Profile // Identity & appearance</span>
        }
        right={<span>Changes apply everywhere your profile shows</span>}
      />

      {/* Sticky save bar */}
      <div className='border-border bg-card/95 sticky bottom-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-2.5 backdrop-blur-md'>
        <p className='text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase'>
          {isDirty ? (
            <>
              <span className='relative flex size-1.5'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75' />
                <span className='relative inline-flex size-1.5 rounded-full bg-amber-500' />
              </span>
              <span className='text-amber-600 dark:text-amber-400'>Unsaved changes</span>
            </>
          ) : (
            <span>All changes saved</span>
          )}
        </p>
        <Button
          type='submit'
          form='settings-form'
          disabled={action.isExecuting}
          className='cursor-pointer'
        >
          {action.isExecuting && <Loader2Icon className='mr-2 size-4 animate-spin' />}
          Save changes
        </Button>
      </div>

      <Form {...form}>
        <form id='settings-form' className='space-y-0' onSubmit={form.handleSubmit(onSubmit)}>
          {/* 01: Identity */}
          <div className='space-y-5 p-5'>
            <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
              {'// 01: Identity'}
            </p>

            <div className='flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8'>
              {/* Live preview card */}
              <div className='border-border bg-muted/20 relative w-full max-w-xs shrink-0 border p-4 md:w-56'>
                <CornerBrackets className='size-2' />
                <span className='bg-card text-muted-foreground absolute -top-2.5 right-2 px-1.5 font-mono text-[9px] tracking-widest uppercase'>
                  Live preview
                </span>
                <div className='flex flex-col items-center gap-3'>
                  <Avatar className='border-border size-20 border sm:size-24'>
                    <AvatarImage src={displayImage} width={96} height={96} alt={displayName} />
                    <AvatarFallback className='bg-muted'>
                      <UserIcon className='text-muted-foreground size-8 sm:size-10' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='text-center'>
                    <div className='font-heading text-foreground text-base font-semibold tracking-tight sm:text-lg'>
                      {displayName}
                    </div>
                    <div className='text-muted-foreground mt-1 max-w-xs text-xs sm:text-sm'>
                      {displayBio.length > 0 ? displayBio : 'No bio yet.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid w-full flex-1 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-semibold'>Name</FormLabel>
                      <FormControl>
                        <Input type='text' id='name' placeholder='Your name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-semibold'>Avatar image URL</FormLabel>
                      <FormControl>
                        <Input
                          type='url'
                          id='image'
                          placeholder='https://example.com/avatar.jpg'
                          className='font-mono text-xs'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel className='text-sm font-semibold'>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          id='bio'
                          placeholder='Tell us about yourself...'
                          className='min-h-[100px] resize-y'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className='bg-border h-px w-full' role='separator' />

          {/* 02: Social links */}
          <div className='space-y-5 p-5'>
            <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
              {'// 02: Social links'}
            </p>

            <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='github'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2 text-sm font-semibold'>
                      <GitBranch className='size-4' />
                      GitHub
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        id='github'
                        placeholder='https://github.com/username'
                        className='font-mono text-xs'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='twitter'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2 text-sm font-semibold'>
                      <X className='size-4' />
                      Twitter
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        id='twitter'
                        placeholder='https://twitter.com/username'
                        className='font-mono text-xs'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='linkedin'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2 text-sm font-semibold'>
                      <LinkIcon className='size-4' />
                      LinkedIn
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        id='linkedin'
                        placeholder='https://linkedin.com/in/username'
                        className='font-mono text-xs'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className='bg-border h-px w-full' role='separator' />

          {/* 03: Appearance */}
          <div className='space-y-4 p-5'>
            <p className='text-muted-foreground font-mono text-[10px] font-semibold tracking-widest uppercase'>
              {'// 03: Appearance'}
            </p>

            <FormField
              control={form.control}
              name='theme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-semibold'>Theme preference</FormLabel>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {themeOptions.map((opt) => {
                      const isActive = field.value === opt.value
                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={() => {
                            field.onChange(opt.value)
                            setTheme(opt.value)
                          }}
                          aria-pressed={isActive}
                          className={cn(
                            'inline-flex cursor-pointer items-center gap-2 border px-3.5 py-2 font-mono text-xs tracking-wider uppercase transition-colors',
                            isActive
                              ? 'border-foreground bg-foreground text-background font-semibold'
                              : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                          )}
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </Frame>
  )
}

export default SettingsForm
