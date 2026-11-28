import { Frame, FrameBody, StripHeader } from '@/components/frame'

type PageHeaderProps = {
  title: string
  description?: string
} & React.ComponentProps<'div'>

const PageHeader = (props: PageHeaderProps) => {
  const { title, description, className, ...rest } = props

  return (
    <Frame className={className} {...rest}>
      <StripHeader
        left={<span className='text-foreground font-semibold'>Section // Overview</span>}
      />
      <FrameBody className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>{title}</h1>
        {description && (
          <p className='text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base'>
            {description}
          </p>
        )}
      </FrameBody>
    </Frame>
  )
}

export default PageHeader
