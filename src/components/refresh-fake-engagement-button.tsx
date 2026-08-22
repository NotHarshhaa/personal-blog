"use client";

import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { refreshFakeEngagementAction } from "@/actions/refresh-fake-engagement-action";
import { Button, toast } from "@/components/ui";

const RefreshFakeEngagementButton = () => {
  const router = useRouter();
  const action = useAction(refreshFakeEngagementAction, {
    onSuccess: ({ data }) => {
      const fakeViews = data?.totalFakeViews ?? 0;
      const fakeLikes = data?.totalFakeLikes ?? 0;
      toast.success(
        `Balanced ${data?.updatedPosts ?? 0} posts to ${fakeViews.toLocaleString()} fake views and ${fakeLikes.toLocaleString()} fake likes`,
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
      {action.isExecuting ? "Balancing engagement" : "Balance fake engagement"}
    </Button>
  );
};

export default RefreshFakeEngagementButton;
