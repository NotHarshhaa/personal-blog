import Image, { type ImageProps } from "next/image";

import { cn } from "@/utils";

type UserAvatarProps = {
  userId: string;
  src: string | null;
  alt: string | null;
} & Omit<ImageProps, "src" | "alt">;

const isValidImageSrc = (value: string | null | undefined): value is string => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const UserAvatar = (props: UserAvatarProps) => {
  const { userId, src, alt, className, ...rest } = props;
  const safeSrc = isValidImageSrc(src) ? src.trim() : `https://robohash.org/${userId}`;

  return (
    <Image
      src={safeSrc}
      alt={alt ?? `${userId}'s avatar`}
      className={cn("rounded-full object-cover", className)}
      quality={90}
      sizes="(max-width: 768px) 48px, 64px"
      {...rest}
    />
  );
};

export default UserAvatar;
