import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => <SelectPrimitive.Trigger ref={ref} className={cn("input select-trigger", className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown size={18} aria-hidden="true" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>,
);
SelectTrigger.displayName = "SelectTrigger";
export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
  ({ className, children, position = "popper", ...props }, ref) => <SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} position={position} sideOffset={6} className={cn("select-content", className)} {...props}><SelectPrimitive.ScrollUpButton className="select-scroll"><ChevronUp size={16} aria-hidden="true" /></SelectPrimitive.ScrollUpButton><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport><SelectPrimitive.ScrollDownButton className="select-scroll"><ChevronDown size={16} aria-hidden="true" /></SelectPrimitive.ScrollDownButton></SelectPrimitive.Content></SelectPrimitive.Portal>,
);
SelectContent.displayName = "SelectContent";
export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
  ({ className, children, ...props }, ref) => <SelectPrimitive.Item ref={ref} className={cn("select-item", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="select-indicator"><Check size={16} aria-hidden="true" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>,
);
SelectItem.displayName = "SelectItem";
export const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(
  ({ className, ...props }, ref) => <SelectPrimitive.Label ref={ref} className={cn("select-label", className)} {...props} />,
);
SelectLabel.displayName = "SelectLabel";
export const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(
  ({ className, ...props }, ref) => <SelectPrimitive.Separator ref={ref} className={cn("select-separator", className)} {...props} />,
);
SelectSeparator.displayName = "SelectSeparator";
