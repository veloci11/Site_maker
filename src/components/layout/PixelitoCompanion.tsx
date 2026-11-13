import { useEffect, useRef } from 'react'
import { PixelitoMascot } from './PixelitoLogo'

type Pose = { x: number; y: number; scale: number; tilt: number }
const SIZE = 22
const poseTransform = ({ x, y, scale, tilt }: Pose) =>
  `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg) scale(${scale})`

/** Short compositor animations, with quiet pauses and no per-frame React work. */
export function PixelitoCompanion({ paused, routeKey }: { paused: boolean; routeKey: string }) {
  const companion = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const actor = companion.current
    const header = actor?.closest<HTMLElement>('.site-header')
    const home = header?.querySelector<HTMLElement>('.pixelito-logo__home')
    if (!actor || !header || !home || typeof actor.animate !== 'function') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const dots = Array.from(header.querySelectorAll<HTMLElement>('[data-pixelito-dot]'))
    if (dots.length !== 2) return
    let timer: number | undefined
    let flight: Animation | undefined
    let generation = 0
    let phase = 0
    let visible = true
    const focused = document.activeElement
    let keyboardFocus = focused instanceof Element && header.contains(focused) && focused.matches(':focus-visible')
    let disposed = false
    let interest: HTMLElement | null = null
    let position: Pose

    const canPlay = () => !paused && !reduced.matches && !document.hidden && visible && !keyboardFocus
    const pointAt = (element: HTMLElement, scale = 1): Pose => {
      const origin = header.getBoundingClientRect()
      const box = element.getBoundingClientRect()
      return { x: box.left - origin.left + box.width / 2 - SIZE / 2,
        y: box.top - origin.top + box.height / 2 - SIZE / 2, scale, tilt: 0 }
    }
    const usable = (element: HTMLElement | null) => element && element.getBoundingClientRect().width > 0
    const schedule = (delay: number) => { timer = window.setTimeout(() => { void visit() }, delay) }

    function reset() {
      if (disposed) return
      generation++
      window.clearTimeout(timer)
      flight?.cancel()
      flight = undefined
      header!.removeAttribute('data-pixelito-perch')
      position = pointAt(home!)
      actor!.style.transform = poseTransform(position)
      actor!.dataset.state = 'home'
      actor!.dataset.sleeping = String(!canPlay())
      actor!.dataset.ready = 'true'
      header!.dataset.pixelitoReady = 'true'
      phase = 0
      if (canPlay()) schedule(1800)
    }

    async function fly(destination: Pose, duration: number, hop: number) {
      const token = generation
      const start = position
      header!.removeAttribute('data-pixelito-perch')
      actor!.dataset.state = 'flying'
      const direction = destination.x >= start.x ? 1 : -1
      actor!.dataset.direction = direction === 1 ? 'right' : 'left'
      const frames = [0, .22, .5, .78, 1].map(t => ({
        offset: t,
        transform: poseTransform({
          x: start.x + (destination.x - start.x) * t,
          y: Math.max(-12, start.y + (destination.y - start.y) * t - Math.sin(Math.PI * t) * hop),
          scale: start.scale + (destination.scale - start.scale) * t,
          tilt: t === 0 || t === 1 ? 0 : direction * Math.sin(Math.PI * t) * 9,
        }),
      }))
      flight = actor!.animate(frames, { duration, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })
      try { await flight.finished } catch { return false }
      if (disposed || token !== generation) return false
      actor!.style.transform = poseTransform(destination)
      flight.cancel()
      flight = undefined
      position = destination
      return true
    }

    async function visit() {
      if (!canPlay()) { reset(); return }
      const stop = phase % 5
      let destination = pointAt(home!)
      let duration = 1000
      let hop = 13
      let rest = 6500
      let dot: number | undefined

      if (stop === 0 || stop === 2) {
        dot = stop === 0 ? 0 : 1
        destination = pointAt(dots[dot], .62)
        duration = stop === 0 ? 720 : 1200
        rest = stop === 0 ? 3000 : 3800
      } else if (stop === 1 || stop === 3) {
        const preferred = stop === 1
          ? (usable(interest) ? interest : header!.querySelector<HTMLElement>('.desktop-nav .is-active'))
          : header!.querySelector<HTMLElement>('.header-login')
        const target = usable(preferred) ? preferred
          : header!.querySelector<HTMLElement>('.mobile-menu-button')
        if (target) {
          destination = pointAt(target, .84)
          destination.y = -5
          if (stop === 3) destination.x += Math.min(28, target.offsetWidth / 4)
          destination.x = Math.max(12, Math.min(header!.clientWidth - SIZE - 12, destination.x))
        }
        duration = 1500
        hop = 8
        rest = stop === 1 ? 3900 : 4200
      } else {
        duration = 1700
      }

      const token = generation
      if (!await fly(destination, duration, hop) || token !== generation) return
      if (dot !== undefined) {
        header!.dataset.pixelitoPerch = String(dot)
        actor!.dataset.state = 'perched'
      } else {
        actor!.dataset.state = stop === 4 ? 'home' : 'watching'
      }
      phase++
      schedule(rest)
    }

    const onInterest = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
      interest = event.target.closest<HTMLElement>('.nav-link, .header-login, .mobile-menu-button')
    }
    const onFocus = () => {
      const active = document.activeElement
      const next = active instanceof Element && header.contains(active) && active.matches(':focus-visible')
      if (next !== keyboardFocus) { keyboardFocus = next; reset() }
    }
    const onFocusOut = () => { queueMicrotask(() => { if (!disposed) onFocus() }) }
    const resize = new ResizeObserver(reset)
    resize.observe(header)
    const wordmark = header.querySelector('.pixelito-wordmark')
    if (wordmark) resize.observe(wordmark)
    const visibility = new IntersectionObserver(entries => {
      const next = entries[0]?.isIntersecting ?? true
      if (next !== visible) { visible = next; reset() }
    })
    visibility.observe(header)
    header.addEventListener('pointerover', onInterest, { passive: true })
    header.addEventListener('focusin', onFocus)
    header.addEventListener('focusout', onFocusOut)
    document.addEventListener('visibilitychange', reset)
    reduced.addEventListener('change', reset)
    reset()
    void document.fonts.ready.then(() => { if (!disposed) reset() })

    return () => {
      disposed = true
      generation++
      window.clearTimeout(timer)
      flight?.cancel()
      resize.disconnect()
      visibility.disconnect()
      header.removeEventListener('pointerover', onInterest)
      header.removeEventListener('focusin', onFocus)
      header.removeEventListener('focusout', onFocusOut)
      document.removeEventListener('visibilitychange', reset)
      reduced.removeEventListener('change', reset)
      header.removeAttribute('data-pixelito-perch')
      header.removeAttribute('data-pixelito-ready')
      actor.removeAttribute('data-ready')
      actor.removeAttribute('data-sleeping')
    }
  }, [paused, routeKey])

  return (
    <span ref={companion} className="pixelito-companion" aria-hidden="true">
      <span className="pixelito-companion__trail"><i /><i /></span>
      <span className="pixelito-companion__body"><PixelitoMascot /></span>
    </span>
  )
}
