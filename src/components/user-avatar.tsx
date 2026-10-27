import Image, { type ImageProps } from "next/image";

import { cn } from "@/utils";

type UserAvatarProps = {
  userId: string;
  src: string | null;
  alt: string | null;
} & Omit<ImageProps, "src" | "alt">;

const UserAvatar = (props: UserAvatarProps) => {
  const { userId, src, alt, className, ...rest } = props;

  return (
    <Image
      src={src ?? `https://robohash.org/${userId}`}
      alt={alt ?? `${userId}'s avatar`}
      className={cn("rounded-full object-cover", className)}
      quality={90}
      sizes="(max-width: 768px) 48px, 64px"
      {...rest}
    />
  );
};

export default UserAvatar;
