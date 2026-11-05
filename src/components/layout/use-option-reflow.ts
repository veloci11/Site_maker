import { useLayoutEffect, useRef } from 'react'

type ItemSnapshot = {
  x: number
  y: number
  width: number
  height: number
  opacity: number
  clone: HTMLElement
}

type LayoutSnapshot = {
  items: Map<string, ItemSnapshot>
  exits: Map<string, ItemSnapshot>
}

const duration = 620
const easing = 'cubic-bezier(.25,.1,.25,1)'

/** FLIP the live rows; keep departing labels outside grid layout while fading.
 * Configuration and totals commit immediately, independently of the animation. */
export function useOptionReflow(selectionKey: string) {
  const listRef = useRef<HTMLUListElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const pending = useRef<LayoutSnapshot | null>(null)
  const moves = useRef(new Set<Animation>())
  const exits = useRef(new Map<string, { node: HTMLElement; animation: Animation }>())

  function stopMoves() {
    for (const animation of moves.current) animation.cancel()
    moves.current.clear()
  }

  function clearExit(key: string) {
    const exit = exits.current.get(key)
    if (!exit) return
    exits.current.delete(key)
    exit.animation.cancel()
    exit.node.remove()
  }

  function snapshot(node: HTMLElement, origin: DOMRect): ItemSnapshot {
    const rect = node.getBoundingClientRect()
    const clone = node.cloneNode(true) as HTMLElement
    const sourceCopy = node.querySelector<HTMLElement>('.selected-plan__option-content')
    const cloneCopy = clone.querySelector<HTMLElement>('.selected-plan__option-content')
    if (sourceCopy && cloneCopy) {
      const style = getComputedStyle(sourceCopy)
      Object.assign(cloneCopy.style, {
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        paddingBottom: style.paddingBottom,
        transition: 'none',
      })
    }
    return {
      x: rect.left - origin.left,
      y: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
      opacity: Number(getComputedStyle(node).opacity),
      clone,
    }
  }

  function capture() {
    const list = listRef.current
    if (!list) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stopMoves()
      for (const key of exits.current.keys()) clearExit(key)
      pending.current = null
      return
    }
    const origin = list.getBoundingClientRect()
    const items = new Map<string, ItemSnapshot>()
    const leaving = new Map<string, ItemSnapshot>()
    for (const node of list.querySelectorAll<HTMLElement>('li[data-option][data-selected=true]'))
      items.set(node.dataset.option!, snapshot(node, origin))
    for (const [key, exit] of exits.current)
      leaving.set(key, snapshot(exit.node, origin))
    pending.current = { items, exits: leaving }
    // Read the interrupted visual positions before removing their transforms.
    stopMoves()
  }

  useLayoutEffect(() => {
    const list = listRef.current
    const frame = frameRef.current
    if (!list || !frame) return
    const measure = () => {
      const height = `${list.getBoundingClientRect().height}px`
      if (frame.style.height !== height) frame.style.height = height
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const preferenceChanged = () => {
      if (!reduced.matches) return
      stopMoves()
      for (const key of exits.current.keys()) clearExit(key)
      pending.current = null
    }
    reduced.addEventListener('change', preferenceChanged)
    return () => {
      observer.disconnect()
      reduced.removeEventListener('change', preferenceChanged)
      stopMoves()
      for (const key of exits.current.keys()) clearExit(key)
    }
  }, [])

  useLayoutEffect(() => {
    const before = pending.current
    pending.current = null
    const list = listRef.current
    if (!before || !list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const origin = list.getBoundingClientRect()
    const current = new Map<string, HTMLElement>()
    const targets = new Map<string, DOMRect>()
    for (const node of list.querySelectorAll<HTMLElement>('li[data-option][data-selected=true]')) {
      current.set(node.dataset.option!, node)
      targets.set(node.dataset.option!, node.getBoundingClientRect())
    }
    for (const [key, node] of current) {
      const rect = targets.get(key)!
      const from = before.items.get(key) ?? before.exits.get(key)
      clearExit(key)
      const x = from ? from.x - (rect.left - origin.left) : 0
      const y = from ? from.y - (rect.top - origin.top) : 8
      if (from && Math.abs(x) < .5 && Math.abs(y) < .5 && from.opacity === 1) continue
      const animation = node.animate([
        { transform: `translate(${x}px,${y}px)`, opacity: from?.opacity ?? 0 },
        { transform: 'translate(0,0)', opacity: 1 },
      ], { duration, easing })
      moves.current.add(animation)
      void animation.finished.then(() => {
        moves.current.delete(animation)
      }, () => {})
    }
    for (const [key, from] of before.items) {
      if (current.has(key)) continue
      clearExit(key)
      const ghost = from.clone
      ghost.removeAttribute('data-option')
      ghost.removeAttribute('data-selected')
      ghost.setAttribute('data-option-exit', '')
      ghost.setAttribute('aria-hidden', 'true')
      ghost.inert = true
      Object.assign(ghost.style, {
        position: 'absolute',
        display: 'grid',
        gridArea: 'auto',
        left: `${from.x}px`,
        top: `${from.y}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
        pointerEvents: 'none',
        zIndex: '1',
      })
      list.appendChild(ghost)
      const animation = ghost.animate([
        { opacity: from.opacity, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-6px)' },
      ], { duration: 420, easing, fill: 'forwards' })
      exits.current.set(key, { node: ghost, animation })
      void animation.finished.then(() => {
        if (exits.current.get(key)?.node === ghost) clearExit(key)
      }, () => {})
    }
  }, [selectionKey])

  return { listRef, frameRef, capture }
}
