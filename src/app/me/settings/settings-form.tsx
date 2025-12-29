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
      <form className='space-y-8 rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 p-5 sm:p-8 shadow-lg relative overflow-hidden' onSubmit={form.handleSubmit(onSubmit)}>
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        
        {/* Live Profile Preview */}
        <div className='flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start mb-6 sm:mb-8'>
          <div className='flex flex-col items-center gap-3'>
            <Avatar className='size-20 sm:size-24 border-2 border-primary/20 shadow-lg ring-2 ring-primary/10'>
              <AvatarImage src={preview.image || image || ''} width={96} height={96} alt={preview.name || name} />
              <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10'>
                <UserIcon className='size-8 sm:size-10 text-primary' />
              </AvatarFallback>
            </Avatar>
            <div className='text-center'>
              <div className='text-base sm:text-lg font-bold'>{preview.name || name}</div>
              <div className='text-muted-foreground text-xs sm:text-sm mt-1 max-w-xs'>{preview.bio || bio || 'No bio yet.'}</div>
            </div>
          </div>
          <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-semibold'>Name</FormLabel>
                  <FormControl>
                    <Input type='text' id='name' placeholder='Your name' className='rounded-xl' {...field} />
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
                  <FormLabel className='text-sm font-semibold'>Avatar Image URL</FormLabel>
                  <FormControl>
                    <Input type='url' id='image' placeholder='https://example.com/avatar.jpg' className='rounded-xl' {...field} />
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
                  <FormLabel className='text-sm font-semibold'>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      id='bio' 
                      placeholder='Tell us about yourself...' 
                      className='rounded-xl min-h-[100px] resize-y border-border/40' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
          <div className="text-xs font-medium text-muted-foreground">Social Links</div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
        </div>
        
        {/* Social Links */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
          <FormField
            control={form.control}
            name='github'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-semibold flex items-center gap-2'>
                  <Github className='w-4 h-4' />
                  GitHub
                </FormLabel>
                <FormControl>
                  <Input type='url' id='github' placeholder='https://github.com/username' className='rounded-xl' {...field} />
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
                <FormLabel className='text-sm font-semibold flex items-center gap-2'>
                  <Twitter className='w-4 h-4' />
                  Twitter
                </FormLabel>
                <FormControl>
                  <Input type='url' id='twitter' placeholder='https://twitter.com/username' className='rounded-xl' {...field} />
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
                <FormLabel className='text-sm font-semibold flex items-center gap-2'>
                  <Linkedin className='w-4 h-4' />
                  LinkedIn
                </FormLabel>
                <FormControl>
                  <Input type='url' id='linkedin' placeholder='https://linkedin.com/in/username' className='rounded-xl' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
          <div className="text-xs font-medium text-muted-foreground">Appearance</div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
        </div>
        
        {/* Theme Preference */}
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-semibold'>Theme Preference</FormLabel>
              <div className='flex flex-wrap gap-3 mt-3'>
                {themeOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type='button'
                    variant={field.value === opt.value ? 'default' : 'outline'}
                    onClick={() => {
                      field.onChange(opt.value)
                      setTheme(opt.value)
                    }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all',
                      field.value === opt.value && 'ring-2 ring-primary shadow-md',
                      'hover:scale-105 motion-reduce:transform-none'
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
        
        {/* Save Button */}
        <div className='flex justify-end pt-4 border-t border-border/20'>
          <Button 
            type='submit' 
            disabled={action.isExecuting} 
            size='lg' 
            className='px-8 py-2.5 text-base font-semibold shadow-md hover:shadow-lg transition-all rounded-xl'
          >
            {action.isExecuting && <Loader2Icon className='mr-2 size-4 animate-spin' />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default SettingsForm
