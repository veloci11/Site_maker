import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, checked, defaultChecked, ...props }, ref) => <CheckboxPrimitive.Root ref={ref} className={cn("checkbox", className)} checked={checked} defaultChecked={defaultChecked} {...props}><CheckboxPrimitive.Indicator className="checkbox-indicator">{checked === "indeterminate" ? <Minus size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}</CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>,
);
Checkbox.displayName = "Checkbox";
