import { Frame, FrameBody, FrameHeader } from "@/components/frame";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ErrorStateProps = {
  status: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions: ReactNode;
  className?: string;
};

const ErrorState = ({
  status,
  title,
  description,
  icon: Icon,
  actions,
  className,
}: ErrorStateProps) => {
  return (
    <Frame className={cn("mx-auto max-w-3xl", className)}>
      <FrameHeader label="System response">
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          {status}
        </span>
      </FrameHeader>
      <FrameBody className="flex flex-col items-center py-12 text-center sm:py-16">
        <div className="mb-6 flex size-16 items-center justify-center border border-border bg-muted/40 sm:size-20">
          <Icon
            className="size-7 text-muted-foreground sm:size-8"
            aria-hidden
          />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          {actions}
        </div>
      </FrameBody>
    </Frame>
  );
};

export default ErrorState;
