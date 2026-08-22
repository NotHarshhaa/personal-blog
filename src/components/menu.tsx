"use client";

import type { User } from "@/db/schema";

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
import {
  UserIcon,
  LogOut,
  Settings,
  FileText,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Log in
      </Link>
    );
  }

  const { id, email = "", role, name: rawName, image: rawImage } = user;
  const name = rawName || "User";
  const image = rawImage || "";

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
        className="w-64 border-border bg-card p-0"
      >
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="bg-muted">
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{name}</p>
                {role && (
                  <span className="inline-flex items-center gap-1 border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase">
                    <BadgeCheck className="size-3" />
                    {role}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        <div className="p-1">
          <DropdownMenuItem asChild>
            <Link href={`/users/${id}`} className="gap-2">
              <UserIcon className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/me/posts" className="gap-2">
              <FileText className="size-4" />
              My Posts
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/me/settings" className="gap-2">
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          {role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="gap-2">
                <ShieldCheck className="size-4" />
                Admin dashboard
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="p-1">
          <DropdownMenuItem onClick={() => signOut()} className="gap-2">
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Menu;
