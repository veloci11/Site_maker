import * as React from "react";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../lib/utils";

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root>>(
  ({ className, ...props }, ref) => <RadioPrimitive.Root className={cn("radio-group", className)} ref={ref} {...props} />,
);
RadioGroup.displayName = "RadioGroup";
export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item>>(
  ({ className, ...props }, ref) => <RadioPrimitive.Item ref={ref} className={cn("radio-group-item", className)} {...props}><RadioPrimitive.Indicator className="radio-group-indicator" /></RadioPrimitive.Item>,
);
RadioGroupItem.displayName = "RadioGroupItem";
