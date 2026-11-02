import { type HTMLAttributes } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Accepted for existing callers; content no longer waits for a timer or observer. */
  delay?: number;
  once?: boolean;
}

/** Always visible: scrolling cannot reveal blank spaces or wait for an observer. */
export function Reveal({ children, className, delay: _delay, once: _once, ...props }: RevealProps) {
  return <div className={cn("motion-reveal", className)} data-visible="true" {...props}>{children}</div>;
}

/** A brief, non-blocking route entrance; routing itself is handled by native React Router links. */
export function PageTransition({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { pathname } = useLocation();
  return <div key={pathname} className={cn("motion-page", className)} {...props}>{children}</div>;
}
