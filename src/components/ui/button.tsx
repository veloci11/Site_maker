import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "button--primary",
      secondary: "button--secondary",
      outline: "button--outline",
      ghost: "button--ghost",
      link: "button--link",
      destructive: "button--destructive",
    },
    size: { default: "button--default", sm: "button--sm", lg: "button--lg", icon: "button--icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return <Component className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...(!asChild ? { type: type ?? "button" } : {})} {...props} />;
  },
);
Button.displayName = "Button";
