"use client";

import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { refreshEngagementAction } from "@/actions/refresh-engagement-action";
import { Button, toast } from "@/components/ui";

const RefreshEngagementButton = () => {
  const router = useRouter();
  const action = useAction(refreshEngagementAction, {
    onSuccess: ({ data }) => {
      const views = data?.totalViews ?? 0;
      const likes = data?.totalLikes ?? 0;
      toast.success(
        `Synchronized ${data?.updatedPosts ?? 0} articles (${views.toLocaleString()} views, ${likes.toLocaleString()} likes)`,
      );
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => action.execute()}
      disabled={action.isExecuting}
    >
      {action.isExecuting ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <RefreshCwIcon />
      )}
      {action.isExecuting ? "Recalculating metrics..." : "Recalculate metrics"}
    </Button>
  );
};

export default RefreshEngagementButton;
