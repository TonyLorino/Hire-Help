import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-700",
        best: "bg-success-light text-success",
        better: "bg-primary-50 text-primary",
        good: "bg-warning-light text-warning",
        bad: "bg-danger-light text-danger",
        concentrate: "bg-success-light text-success",
        consider: "bg-warning-light text-warning",
        eliminate: "bg-danger-light text-danger",
        advance: "bg-success-light text-success",
        hold: "bg-warning-light text-warning",
        reject: "bg-danger-light text-danger",
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
