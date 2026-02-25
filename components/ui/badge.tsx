import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
        best: "bg-success-light dark:bg-green-900/40 text-success dark:text-green-400",
        better: "bg-primary-50 dark:bg-primary/20 text-primary",
        good: "bg-warning-light dark:bg-yellow-900/40 text-warning dark:text-yellow-400",
        bad: "bg-danger-light dark:bg-red-900/40 text-danger dark:text-red-400",
        concentrate: "bg-success-light dark:bg-green-900/40 text-success dark:text-green-400",
        consider: "bg-warning-light dark:bg-yellow-900/40 text-warning dark:text-yellow-400",
        eliminate: "bg-danger-light dark:bg-red-900/40 text-danger dark:text-red-400",
        advance: "bg-success-light dark:bg-green-900/40 text-success dark:text-green-400",
        hold: "bg-warning-light dark:bg-yellow-900/40 text-warning dark:text-yellow-400",
        reject: "bg-danger-light dark:bg-red-900/40 text-danger dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
