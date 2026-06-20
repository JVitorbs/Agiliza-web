import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/app/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:     "bg-indigo-500 text-white shadow hover:bg-indigo-400",
        destructive: "bg-red-500 text-white shadow hover:bg-red-400",
        outline:     "border border-border bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:   "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost:       "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
        link:        "text-indigo-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-12 rounded-md px-8 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }
