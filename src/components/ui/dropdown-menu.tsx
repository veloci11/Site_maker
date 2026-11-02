import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuPortal = DropdownPrimitive.Portal;
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>>(
  ({ className, sideOffset = 6, ...props }, ref) => <DropdownPrimitive.Portal><DropdownPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("dropdown-content", className)} {...props} /></DropdownPrimitive.Portal>,
);
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => <DropdownPrimitive.Item ref={ref} className={cn("dropdown-item", inset && "dropdown-item--inset", className)} {...props} />,
);
DropdownMenuItem.displayName = "DropdownMenuItem";
export const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>>(
  ({ className, ...props }, ref) => <DropdownPrimitive.Label ref={ref} className={cn("select-label", className)} {...props} />,
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";
export const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>>(
  ({ className, ...props }, ref) => <DropdownPrimitive.Separator ref={ref} className={cn("select-separator", className)} {...props} />,
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
export const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof DropdownPrimitive.CheckboxItem>>(
  ({ className, children, ...props }, ref) => <DropdownPrimitive.CheckboxItem ref={ref} className={cn("dropdown-item dropdown-item--checkbox", className)} {...props}><DropdownPrimitive.ItemIndicator className="dropdown-check"><Check size={15} aria-hidden="true" /></DropdownPrimitive.ItemIndicator>{children}</DropdownPrimitive.CheckboxItem>,
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";
