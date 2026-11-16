type ComparisonScrollGeometry = {
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
  viewportLeft: number
  tableRight: number
  labelWidth: number
  columnLeft: number
}

/** Align an offer beside the fixed labels without scrolling beyond the table. */
export function comparisonColumnScrollLeft(geometry: ComparisonScrollGeometry): number {
  const { scrollLeft, clientWidth, scrollWidth, viewportLeft, tableRight, labelWidth, columnLeft } = geometry
  const tableEnd = scrollLeft + tableRight - viewportLeft
  const maximum = Math.max(0, Math.min(scrollWidth - clientWidth, tableEnd - clientWidth))
  const target = scrollLeft + columnLeft - viewportLeft - labelWidth
  return Math.max(0, Math.min(maximum, target))
}
