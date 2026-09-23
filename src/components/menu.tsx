"use client";

import type { User } from "@/db/schema";

import {
  Bookmark,
  Compass,
  FileText,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { CornerBrackets } from "@/components/frame";
import { cn } from "@/lib/utils";

type MenuProps = {
  user: User | null;
};

const Menu = ({ user }: MenuProps) => {
  const pathname = usePathname();

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${pathname}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-2.5 text-xs")}
      >
        Log in
      </Link>
    );
  }

  const { id, email, role, name, image: rawImage } = user;
  const image = rawImage ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User menu"
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Avatar className="size-8 border border-border sm:size-9">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-muted">
              <UserIcon className="size-3.5 sm:size-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="relative w-64 border-border bg-card p-0 shadow-xl"
      >
        <CornerBrackets />
        <div className="border-b border-border bg-muted/30 px-3.5 py-2 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              // USER_SESSION
            </span>
            {role && (
              <span className="border border-border bg-foreground px-1.5 py-0.5 text-[9px] font-bold text-background uppercase">
                {role}
              </span>
            )}
          </div>
        </div>

        <div className="border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border border-border">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="bg-muted font-mono text-xs">
                {name?.slice(0, 2).toUpperCase() || 'OP'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">{name}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        <div className="p-1 font-mono text-xs">
          <DropdownMenuItem asChild>
            <Link href={`/users/${id}`} className="gap-2 cursor-pointer">
              <UserIcon className="size-3.5 text-muted-foreground" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/me/posts" className="gap-2 cursor-pointer">
              <FileText className="size-3.5 text-muted-foreground" />
              <span>My Posts & Studio</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/bookmarks" className="gap-2 cursor-pointer">
              <Bookmark className="size-3.5 text-muted-foreground" />
              <span>Bookmarks</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/roadmaps" className="gap-2 cursor-pointer">
              <Compass className="size-3.5 text-muted-foreground" />
              <span>Roadmaps</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/newsletter" className="gap-2 cursor-pointer">
              <Mail className="size-3.5 text-muted-foreground" />
              <span>Newsletter Dispatch</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/me/settings" className="gap-2 cursor-pointer">
              <Settings className="size-3.5 text-muted-foreground" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          {role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="gap-2 text-foreground font-medium cursor-pointer">
                <ShieldCheck className="size-3.5" />
                <span>Admin Console</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-border" />

        <div className="p-1 font-mono text-xs">
          <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
            <LogOut className="size-3.5" />
            <span>[Log Out]</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Menu;
