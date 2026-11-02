import { cn } from "../../lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, variant = "secondary", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "outline" | "destructive" }) {
  return <span className={cn("badge", `badge--${variant}`, className)} {...props} />;
}
