import { cn } from '@/utils'
import Image, { type ImageProps } from 'next/image'

type UserAvatarProps = {
  userId: string
  src: string | null
  alt: string | null
} & Omit<ImageProps, 'src' | 'alt'>

const UserAvatar = (props: UserAvatarProps) => {
  const { userId, src, alt, className, ...rest } = props

  return (
    <Image
      src={src ?? `https://robohash.org/${userId}`}
      alt={alt ?? `${userId}'s avatar`}
      className={cn('rounded-full', className)}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      sizes="(max-width: 768px) 32px, 48px"
      {...rest}
    />
  )
}

export default UserAvatar
