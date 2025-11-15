import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#8B6FD9] to-[#6C48C5] text-white hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(108,72,197,0.25)] border-none",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-[#6C48C5] bg-transparent text-[#6C48C5] hover:bg-[#E8DEFF] hover:scale-[1.02] shadow-xs dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-[#C68FFF] text-white hover:bg-[#C68FFF]/80 hover:scale-[1.02]",
        ghost:
          "hover:bg-[#E8DEFF] hover:text-[#6C48C5] dark:hover:bg-accent/50",
        link: "text-[#6C48C5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6 py-4 rounded-2xl has-[>svg]:px-3 min-h-[56px]",
        sm: "h-10 rounded-xl gap-1.5 px-4 has-[>svg]:px-2.5",
        lg: "h-16 rounded-2xl px-8 has-[>svg]:px-4 min-h-[56px]",
        icon: "size-14 rounded-2xl",
        "icon-sm": "size-10 rounded-xl",
        "icon-lg": "size-16 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
