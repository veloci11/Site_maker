import { forwardRef, type CSSProperties, type MouseEvent } from 'react'
import {
  Link,
  NavLink,
  useNavigate,
  useViewTransitionState,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom'

export function canAnimatePlanNavigation() {
  return typeof document !== 'undefined'
    && typeof document.startViewTransition === 'function'
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useMotionLinkClick(props: LinkProps | NavLinkProps) {
  const navigate = useNavigate()
  return (event: MouseEvent<HTMLAnchorElement>) => {
    props.onClick?.(event)
    if (event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || (props.target && props.target !== '_self') || props.reloadDocument
      || event.currentTarget.hasAttribute('download')
      || !props.viewTransition
      || (typeof props.to === 'string' && /^([a-z][a-z\d+.-]*:|\/\/)/i.test(props.to))) return

    event.preventDefault()
    // Read the preference at click time too: it can change since Link rendered.
    const animate = canAnimatePlanNavigation()
    // Commit through the router synchronously: a second click must supersede
    // the current animation, never replay its pending route when it finishes.
    // Modified clicks and unsupported browsers retain the original Link behavior.
    navigate(props.to, {
      replace: props.replace ?? event.currentTarget.href === window.location.href,
      state: props.state,
      relative: props.relative,
      preventScrollReset: props.preventScrollReset,
      viewTransition: animate,
      flushSync: animate,
    })
  }
}

export const MotionLink = forwardRef<HTMLAnchorElement, LinkProps>(function MotionLink(props, ref) {
  const onClick = useMotionLinkClick(props)
  return <Link {...props} ref={ref} onClick={onClick} />
})

export const MotionNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function MotionNavLink(props, ref) {
  const onClick = useMotionLinkClick(props)
  return <NavLink {...props} ref={ref} onClick={onClick} />
})

export function usePlanTransition(variant: string, href: string, part: 'surface' | 'content' = 'surface'): CSSProperties {
  const transitioning = useViewTransitionState(href)
  return {
    viewTransitionName: transitioning ? `plan-${variant}${part === 'content' ? '-content' : ''}` : undefined,
    viewTransitionClass: `plan-${part}`,
  }
}
