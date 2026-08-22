"use client";

import { Badge } from "@/components/ui";
import { ShieldCheckIcon, UserIcon, StarIcon, GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRoleBadgeProps = {
  role: string;
  className?: string;
  compact?: boolean;
};

const roleConfig = {
  admin: {
    icon: <ShieldCheckIcon />,
    label: "Admin",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  moderator: {
    icon: <StarIcon />,
    label: "Moderator",
    className: "border-foreground/20 bg-secondary text-secondary-foreground",
  },
  user: {
    icon: <UserIcon />,
    label: "User",
    className: "border-border bg-muted text-muted-foreground",
  },
  guest: {
    icon: <GlobeIcon />,
    label: "Guest",
    className: "border-border bg-background text-muted-foreground",
  },
};

const UserRoleBadge = ({
  role,
  className,
  compact = false,
}: UserRoleBadgeProps) => {
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

  return (
    <Badge
      aria-label={config.label}
      className={cn(
        "gap-1 rounded-sm border px-2 py-1 font-semibold tracking-[0.08em] uppercase",
        "transition-colors",
        config.className,
        compact && "px-1.5 py-0.5 text-[10px]",
        className,
      )}
    >
      <span className="[&>svg]:size-3">{config.icon}</span>
      {config.label}
    </Badge>
  );
};

export default UserRoleBadge;
