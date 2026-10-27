'use client'

import { Loader2Icon, PencilIcon, PlusIcon, TerminalIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { createSnippetAction } from '@/actions/create-snippet-action'
import { deleteSnippetAction } from '@/actions/delete-snippet-action'
import { updateSnippetAction } from '@/actions/update-snippet-action'
import { Frame, FrameHeader } from '@/components/frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { formatPostDate } from '@/utils/format-post-date'

export type ManagedSnippet = {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}

const LANGUAGES = [
  'bash',
  'sh',
  'powershell',
  'hcl',
  'yaml',
  'json',
  'python',
  'go',
  'sql',
  'dockerfile',
  'typescript',
  'javascript',
  'makefile',
  'plaintext'
]

const emptyForm = {
  title: '',
  description: '',
  language: 'bash',
  tagsInput: '',
  code: '',
  published: false
}

type SnippetManagerProps = {
  initialSnippets: ManagedSnippet[]
}

const SnippetManager = ({ initialSnippets }: SnippetManagerProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const startEdit = (snippet: ManagedSnippet) => {
    setEditingId(snippet.id)
    setForm({
      title: snippet.title,
      description: snippet.description ?? '',
      language: snippet.language,
      tagsInput: snippet.tags.join(', '),
      code: snippet.code,
      published: snippet.published
    })
    globalThis.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = () => {
    if (isPending) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      code: form.code,
      language: form.language,
      tags: form.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
      published: form.published
    }

    if (payload.title.length === 0 || payload.code.trim().length === 0) {
      toast.error('Title and code are required')
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateSnippetAction({ snippetId: editingId, ...payload })
          toast.success('Snippet updated')
        } else {
          await createSnippetAction(payload)
          toast.success('Snippet filed in the vault')
        }
        resetForm()
        router.refresh()
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  const handleDelete = (snippet: ManagedSnippet) => {
    if (isPending) return
    if (!globalThis.confirm(`Delete "${snippet.title}" permanently?`)) return

    startTransition(async () => {
      try {
        await deleteSnippetAction({ snippetId: snippet.id })
        toast.success('Snippet deleted')
        if (editingId === snippet.id) resetForm()
        router.refresh()
      } catch {
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  let SubmitIcon = PlusIcon
  let submitIconClassName = 'size-3.5'
  if (isPending) {
    SubmitIcon = Loader2Icon
    submitIconClassName = 'size-3.5 animate-spin'
  } else if (editingId) {
    SubmitIcon = PencilIcon
  }

  return (
    <div className='space-y-6'>
      <Frame as='section'>
        <FrameHeader label={editingId ? 'Edit snippet' : 'File new snippet'}>
          {editingId && (
            <Button type='button' variant='ghost' size='sm' onClick={resetForm}>
              <XIcon className='size-3.5' />
              Cancel
            </Button>
          )}
        </FrameHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
          className='space-y-4 p-4 sm:p-5'
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='snippet-title'>Title</Label>
              <Input
                id='snippet-title'
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder='Force-delete a stuck Terraform state lock'
                maxLength={120}
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='snippet-language'>Language</Label>
              <Select value={form.language} onValueChange={(value) => setField('language', value)}>
                <SelectTrigger id='snippet-language' className='w-full'>
                  <SelectValue placeholder='Language' />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language} className='uppercase'>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='snippet-description'>Description (optional)</Label>
            <Input
              id='snippet-description'
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder='One-line context on when this fix applies'
              maxLength={300}
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='snippet-tags'>Tags (comma-separated)</Label>
            <Input
              id='snippet-tags'
              value={form.tagsInput}
              onChange={(e) => setField('tagsInput', e.target.value)}
              placeholder='kubernetes, terraform, git'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='snippet-code'>Code</Label>
            <Textarea
              id='snippet-code'
              value={form.code}
              onChange={(e) => setField('code', e.target.value)}
              placeholder={'terraform force-unlock <LOCK_ID>'}
              rows={10}
              required
              className='resize-y font-mono text-[13px]'
            />
          </div>

          <div className='border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 border px-3.5 py-3'>
            <div className='flex items-center gap-2.5'>
              <Switch
                id='snippet-published'
                checked={form.published}
                onCheckedChange={(checked) => setField('published', checked)}
              />
              <Label htmlFor='snippet-published' className='cursor-pointer'>
                Published (visible in the vault + raw endpoint)
              </Label>
            </div>
            <Button type='submit' disabled={isPending}>
              <SubmitIcon className={submitIconClassName} />
              {editingId ? 'Save changes' : 'File snippet'}
            </Button>
          </div>
        </form>
      </Frame>

      <Frame as='section'>
        <FrameHeader label='Vault inventory'>
          <span className='text-muted-foreground font-mono text-[10px] tracking-wider uppercase'>
            {initialSnippets.length} total
          </span>
        </FrameHeader>
        <div className='divide-border divide-y'>
          {initialSnippets.length === 0 && (
            <p className='text-muted-foreground px-4 py-8 text-center font-mono text-xs sm:px-5'>
              No snippets filed yet
            </p>
          )}
          {initialSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className='hover:bg-muted/40 flex flex-wrap items-center gap-3 px-4 py-3 transition-colors sm:px-5'
            >
              <span className='border-border bg-background flex size-8 shrink-0 items-center justify-center border'>
                <TerminalIcon className='text-muted-foreground size-3.5' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold'>
                  {snippet.title}
                  {!snippet.published && (
                    <span className='border-border text-muted-foreground ml-2 border px-1.5 py-0.5 align-middle font-mono text-[9px] tracking-wider uppercase'>
                      Draft
                    </span>
                  )}
                </p>
                <p className='text-muted-foreground font-mono text-[10px] tracking-wider uppercase'>
                  {snippet.language} · {formatPostDate(snippet.createdAt, { relative: true })} ·{' '}
                  {snippet.code.split('\n').length} lines
                </p>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => startEdit(snippet)}
                  disabled={isPending}
                >
                  <PencilIcon className='size-3.5' />
                  Edit
                </Button>
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(snippet)}
                  disabled={isPending}
                >
                  <Trash2Icon className='size-3.5' />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        {initialSnippets.length > 0 && (
          <div className='border-border border-t px-4 py-2 sm:px-5'>
            <p className='text-muted-foreground font-mono text-[10px]'>
              Raw endpoint per snippet:{' '}
              <span className='text-foreground'>/raw/&lt;snippet-id&gt;</span> — drafts return 404
            </p>
          </div>
        )}
      </Frame>
    </div>
  )
}

export default SnippetManager
