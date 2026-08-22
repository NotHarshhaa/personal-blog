"use client";

import type { User } from "@/db/schema";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  buttonVariants,
  toast,
} from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useRef } from "react";
import {
  FileText,
  FileCheck2,
  Heart,
  Search,
  Inbox,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";

import { deleteDraftPostsAction } from "@/actions/delete-draft-posts-action";
import NewPostButton from "@/components/new-post-button";
import PostCard, { type PostCardProps } from "@/components/post-card";
import { useAction } from "next-safe-action/hooks";

// Illustration for empty state
const EmptyIllustration = ({ isAdmin }: { isAdmin: boolean }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
    <span className="mb-4 flex size-14 items-center justify-center border border-border bg-background">
      <Inbox className="size-7 text-muted-foreground" />
    </span>
    <div className="mb-2 text-lg font-semibold">
      {isAdmin ? "No posts found" : "No liked posts found"}
    </div>
    <div className="mb-6 max-w-md text-sm text-muted-foreground">
      {isAdmin
        ? "Start writing your first post or check your filters."
        : "Start liking posts to see them here."}
    </div>
    {isAdmin && <NewPostButton />}
  </div>
);

type ContentProps = {
  posts: Array<PostCardProps["post"]>;
  user: User;
};

const PostsClient = (props: ContentProps) => {
  const { posts, user } = props;
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") ?? "drafts";
  const [activeTab, setActiveTab] = useState(tab);
  const [search, setSearch] = useState("");
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === "admin";

  const deleteDraftsAction = useAction(deleteDraftPostsAction, {
    onSuccess: () => {
      setIsDeleteAllOpen(false);
      toast.success("All drafts deleted");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
  });

  const handleDeleteAllDrafts = async () => {
    await deleteDraftsAction.executeAsync();
  };

  // Stats (admin only)
  const drafts = useMemo(
    () => posts.filter((post) => !post.published),
    [posts],
  );
  const published = useMemo(
    () => posts.filter((post) => post.published),
    [posts],
  );
  const totalLikes = useMemo(
    () => posts.reduce((acc, p) => acc + (p.likeCount || 0), 0),
    [posts],
  );

  // Filtered posts
  const filteredDrafts = useMemo(
    () =>
      drafts.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [drafts, search],
  );
  const filteredPublished = useMemo(
    () =>
      published.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [published, search],
  );

  // For users: liked posts only
  const likedPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.likes?.some((like) => like.id === user.id) &&
          (p.title?.toLowerCase().includes(search.toLowerCase()) ||
            (p.description ?? "").toLowerCase().includes(search.toLowerCase())),
      ),
    [posts, user.id, search],
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/me/posts?tab=${value}`);
  };

  if (!isAdmin) {
    // User: only liked posts
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search liked posts..."
              className="border-border bg-background py-2.5 pr-3 pl-9"
              aria-label="Search liked posts"
            />
          </div>
        </div>
        {likedPosts.length === 0 ? (
          <EmptyIllustration isAdmin={false} />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {likedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                showAuthor={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin: full UI
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-border px-4 py-3 text-sm sm:gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <FileText className="size-3.5 text-muted-foreground" />
            <span>{drafts.length} Drafts</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <FileCheck2 className="size-3.5 text-muted-foreground" />
            <span>{published.length} Published</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Heart className="size-3.5 text-muted-foreground" />
            <span>{totalLikes} Likes</span>
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">
          Total: {posts.length}
        </span>
      </div>
      {/* Search bar */}
      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your posts..."
            className="border-border bg-background py-2.5 pr-3 pl-9"
            aria-label="Search posts"
          />
        </div>
      </div>
      {/* Tabs */}
      <Tabs
        defaultValue="drafts"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="mb-6 border border-border bg-muted/40 p-0">
          <TabsTrigger
            value="drafts"
            className="border-r border-border data-[state=active]:bg-background"
          >
            <FileText className="mr-2 size-4" />
            <span>Drafts</span>
            {drafts.length > 0 && (
              <span className="ml-1.5 border border-border px-2 py-0.5 text-xs font-semibold">
                {drafts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="published"
            className="data-[state=active]:bg-background"
          >
            <FileCheck2 className="mr-2 size-4" />
            <span>Published</span>
            {published.length > 0 && (
              <span className="ml-1.5 border border-border px-2 py-0.5 text-xs font-semibold">
                {published.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="drafts" className="mt-0">
          {drafts.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-border px-3 py-2.5 sm:px-4">
              <span className="text-sm text-muted-foreground">
                {drafts.length} {drafts.length === 1 ? "draft" : "drafts"} saved
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteAllOpen(true)}
                disabled={deleteDraftsAction.isExecuting}
              >
                <Trash2Icon className="size-4" />
                Delete all drafts
              </Button>
            </div>
          )}
          {filteredDrafts.length === 0 ? (
            <EmptyIllustration isAdmin={true} />
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredDrafts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="published" className="mt-0">
          {filteredPublished.length === 0 ? (
            <EmptyIllustration isAdmin={true} />
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredPublished.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all drafts?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {drafts.length} drafts. Published
              posts will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDraftsAction.isExecuting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllDrafts}
              disabled={deleteDraftsAction.isExecuting}
              className={buttonVariants({ variant: "destructive" })}
            >
              {deleteDraftsAction.isExecuting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Delete all drafts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostsClient;
