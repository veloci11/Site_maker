import type { Location } from 'react-router-dom'

/** React Router may retain the original endpoint order for a reversed POP.
 * Its committed destination key identifies the actual arrival in both phases. */
export function normalizePlanTransitionLocations<T extends Pick<Location, 'key'>>(
  currentLocation: T,
  nextLocation: T,
  targetKey: string | undefined,
): { fromLocation: T; toLocation: T } | null {
  if (currentLocation.key === nextLocation.key) return null
  if (targetKey === currentLocation.key)
    return { fromLocation: nextLocation, toLocation: currentLocation }
  if (targetKey === nextLocation.key)
    return { fromLocation: currentLocation, toLocation: nextLocation }
  return null
}
