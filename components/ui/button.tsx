import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------
   BUTTON VARIANTS – PILL-ALIGNED (GLASS FIRST)
----------------------------------------------------- */

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-40",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "rounded-full",
    "relative",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ---------------- PRIMARY (GLASS) ---------------- */

        glass: [
          "border border-white/30",
          "bg-white text-black",
          "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
          "hover:bg-white/90",
          "hover:shadow-[0_18px_45px_rgba(0,0,0,0.45)]",
          "active:scale-[0.98]",
        ].join(" "),

        /* ---------------- SECONDARY (GLASS OUTLINE) ---------------- */

        "glass-outline": [
          "lux-control",
          "hover:border-white/24",
          "active:scale-[0.98]",
        ].join(" "),

        /* ---------------- TERTIARY ---------------- */

        ghost: [
          "bg-transparent text-white/80",
          "hover:bg-white/10 hover:text-white",
        ].join(" "),

        link: [
          "bg-transparent text-white underline-offset-4",
          "hover:underline hover:text-white",
        ].join(" "),

        /* ---------------- DESTRUCTIVE ---------------- */

        destructive: [
          "border border-red-500/40",
          "bg-red-950/80 text-red-100",
          "hover:bg-red-500/30",
          "focus-visible:ring-red-500/40",
        ].join(" "),

        /* ---------------- LEGACY / FALLBACK ---------------- */
        /* Keep for backward compatibility */

        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },

      size: {
        sm: "h-11 px-6 text-sm",
        default: "h-14 px-8 text-base",
        lg: "h-14 px-10 text-base",
        xl: "h-16 px-12 text-lg",

        icon: "h-14 w-14 p-0",
        "icon-sm": "h-11 w-11 p-0",
      },
    },

    defaultVariants: {
      variant: "glass", // 🔑 GLASS-FIRST DEFAULT
      size: "default",
    },
  }
);


/* -----------------------------------------------------
   LOADER
----------------------------------------------------- */

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

/* -----------------------------------------------------
   BUTTON COMPONENT
----------------------------------------------------- */

type ButtonProps =
  React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size }),
        loading && "cursor-wait",
        className
      )}
      {...props}
    >
      {/* Content (hidden but space-preserving) */}
      <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
        {children}
      </span>

      {/* Loader overlay */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
