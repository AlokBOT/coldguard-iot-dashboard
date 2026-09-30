import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25",
        outline:
          "border border-slate-300 bg-white/80 px-5 text-slate-800 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
        ghost: "px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        soft: "bg-blue-50 px-4 text-blue-700 hover:bg-blue-100",
        state:
          "border border-slate-200 bg-white px-4 text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50",
      },
      size: {
        default: "h-11",
        sm: "h-10 min-h-10 text-xs",
        lg: "h-12 px-6",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) =>
    React.createElement("button", {
      ref,
      type,
      className: cn(buttonVariants({ variant, size, className })),
      ...props,
    }),
);

Button.displayName = "Button";
