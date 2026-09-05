import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-muted",
        "animate-pulse",
        "motion-safe:animate-shimmer motion-safe:bg-[linear-gradient(90deg,var(--color-oreo-surface),var(--color-oreo-lavender),var(--color-oreo-surface))] motion-safe:bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
