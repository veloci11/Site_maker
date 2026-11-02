import { cn } from "../../lib/utils";
import type { HTMLAttributes } from "react";

export function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("divider", className)} {...props} />;
}
