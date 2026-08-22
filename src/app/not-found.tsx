import { ArrowLeftIcon, FileQuestionIcon } from "lucide-react";
import Link from "next/link";

import ErrorState from "@/components/error-state";
import { buttonVariants } from "@/components/ui";

const NotFound = () => {
  return (
    <ErrorState
      status="404 / Route not found"
      title="This page is missing"
      description="The page may have moved, been removed, or never existed. Head back home or browse the latest posts to find something useful."
      icon={FileQuestionIcon}
      actions={
        <>
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            <ArrowLeftIcon className="size-4" />
            Return home
          </Link>
          <Link
            href="/posts"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Browse posts
          </Link>
        </>
      }
    />
  );
};

export default NotFound;
