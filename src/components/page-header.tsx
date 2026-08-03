import { Frame, FrameBody, FrameHeader } from '@/components/frame'

type PageHeaderProps = {
  title: string
  description?: string
} & React.ComponentProps<'div'>

const PageHeader = (props: PageHeaderProps) => {
  const { title, description, className, ...rest } = props

  return (
    <Frame className={className} {...rest}>
      <FrameHeader label="Page" />
      <FrameBody className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </FrameBody>
    </Frame>
  )
}

export default PageHeader
