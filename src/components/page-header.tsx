type PageHeaderProps = {
  title: string
  description?: string
} & React.ComponentProps<'div'>

const PageHeader = (props: PageHeaderProps) => {
  const { title, description, ...rest } = props

  return (
    <div {...rest} className="mb-8 sm:mb-12">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50" />
        <h1 className='text-2xl sm:text-3xl font-bold'>{title}</h1>
      </div>
      {description && (
        <p className='text-muted-foreground text-sm sm:text-base ml-4 leading-relaxed'>{description}</p>
      )}
    </div>
  )
}

export default PageHeader
