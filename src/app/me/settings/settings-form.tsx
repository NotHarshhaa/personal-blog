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
  toast
} from '@tszhong0411/ui'
import { Loader2Icon, UserIcon, SunIcon, MoonIcon, MonitorIcon, Github, Twitter, Linkedin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useForm, useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

import { updateUserSchema } from '@/actions/schema'
import { updateUserAction } from '@/actions/update-user-action'

type SettingsFormProps = {
  user: User
}

const themeOptions = [
  { value: 'system', label: 'System', icon: <MonitorIcon className='w-4 h-4' /> },
  { value: 'light', label: 'Light', icon: <SunIcon className='w-4 h-4' /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon className='w-4 h-4' /> },
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

  const form = useForm<z.infer<typeof updateUserSchema> & {
    github?: string
    twitter?: string
    linkedin?: string
    theme?: string
  }>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: name,
      image: image ?? '',
      bio: bio ?? '',
      github: '',
      twitter: '',
      linkedin: '',
      theme: 'system',
    }
  })

  // Live preview
  const preview = useWatch({ control: form.control })

  const onSubmit = async (values: z.infer<typeof updateUserSchema> & { github?: string; twitter?: string; linkedin?: string; theme?: string }) => {
    await action.executeAsync(values)
  }

  return (
    <Form {...form}>
      <form className='space-y-8 rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 p-6 shadow-lg' onSubmit={form.handleSubmit(onSubmit)}>
        {/* Live Profile Preview */}
        <div className='flex flex-col md:flex-row gap-8 items-center md:items-start mb-6'>
          <div className='flex flex-col items-center gap-2'>
            <Avatar className='size-24 shadow-md'>
              <AvatarImage src={preview.image || image || ''} width={96} height={96} alt={preview.name || name} />
              <AvatarFallback>
                <UserIcon className='size-10' />
              </AvatarFallback>
            </Avatar>
            <div className='text-lg font-semibold'>{preview.name || name}</div>
            <div className='text-muted-foreground text-sm'>{preview.bio || bio || 'No bio yet.'}</div>
          </div>
          <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type='text' id='name' placeholder='Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Image */}
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar Image URL</FormLabel>
                  <FormControl>
                    <Input type='url' id='image' placeholder='Image URL' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Bio */}
            <FormField
              control={form.control}
              name='bio'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input type='text' id='bio' placeholder='Bio' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* Social Links */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <FormField
            control={form.control}
            name='github'
            render={({ field }) => (
              <FormItem>
                <FormLabel><Github className='inline w-4 h-4 mr-1' /> GitHub</FormLabel>
                <FormControl>
                  <Input type='url' id='github' placeholder='GitHub profile URL' {...field} />
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
                <FormLabel><Twitter className='inline w-4 h-4 mr-1' /> Twitter</FormLabel>
                <FormControl>
                  <Input type='url' id='twitter' placeholder='Twitter profile URL' {...field} />
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
                <FormLabel><Linkedin className='inline w-4 h-4 mr-1' /> LinkedIn</FormLabel>
                <FormControl>
                  <Input type='url' id='linkedin' placeholder='LinkedIn profile URL' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Theme Preference */}
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme Preference</FormLabel>
              <div className='flex gap-3 mt-2'>
                {themeOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type='button'
                    variant={field.value === opt.value ? 'default' : 'outline'}
                    onClick={() => {
                      field.onChange(opt.value)
                      setTheme(opt.value)
                    }}
                    className={cn('flex items-center gap-2 px-4 py-2 rounded-lg', field.value === opt.value && 'ring-2 ring-primary')}
                  >
                    {opt.icon} {opt.label}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Save Button */}
        <div className='flex justify-end'>
          <Button type='submit' disabled={action.isExecuting} size='lg' className='px-8 py-2 text-base font-semibold shadow-md'>
            {action.isExecuting && <Loader2Icon className='mr-2 size-4 animate-spin' />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default SettingsForm
