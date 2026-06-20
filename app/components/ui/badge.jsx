import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/app/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-indigo-500/20 text-indigo-300",
        secondary:   "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-red-500/20 text-red-400",
        outline:     "border-border text-muted-foreground",
        success:     "border-transparent bg-green-500/20 text-green-400",
        warning:     "border-transparent bg-yellow-500/20 text-yellow-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
