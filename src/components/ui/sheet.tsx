import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetPortal = SheetPrimitive.Portal;
export const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Overlay ref={ref} className={cn("dialog-overlay sheet-overlay", className)} {...props} />,
);
SheetOverlay.displayName = "SheetOverlay";
interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> { side?: "top" | "right" | "bottom" | "left"; showCloseButton?: boolean; }
export const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "right", className, children, showCloseButton = true, ...props }, ref) => <SheetPortal><SheetOverlay /><SheetPrimitive.Content ref={ref} className={cn("sheet-content", `sheet-content--${side}`, className)} {...props}>{children}{showCloseButton ? <SheetPrimitive.Close className="icon-button sheet-close" aria-label="Fermer le menu"><X size={22} aria-hidden="true" /></SheetPrimitive.Close> : null}</SheetPrimitive.Content></SheetPortal>,
);
SheetContent.displayName = "SheetContent";
export const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Title ref={ref} className={cn("dialog-title", className)} {...props} />,
);
SheetTitle.displayName = "SheetTitle";
export const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Description ref={ref} className={cn("dialog-description", className)} {...props} />,
);
SheetDescription.displayName = "SheetDescription";
export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("dialog-header", className)} {...props} />;
export const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("dialog-footer", className)} {...props} />;
