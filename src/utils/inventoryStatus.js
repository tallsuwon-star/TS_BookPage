// 재고상태 판정 규칙
//   현재재고 <= 안전재고            -> 재고부족 (shortage)
//   안전재고 < 현재재고 <= 안전재고*1.3 -> 주의 (warning)
//   그 외                          -> 정상 (normal)
export const STOCK_STATUS = {
  shortage: { key: 'shortage', label: '재고부족', color: '#dc2626', bg: '#fef2f2' },
  warning: { key: 'warning', label: '주의', color: '#b45309', bg: '#fffbeb' },
  normal: { key: 'normal', label: '정상', color: '#15803d', bg: '#f0fdf4' },
}

export function getStockStatusKey(currentStock, safetyStock) {
  const current = Number(currentStock) || 0
  const safety = Number(safetyStock) || 0
  if (current <= safety) return 'shortage'
  if (current <= safety * 1.3) return 'warning'
  return 'normal'
}

export function getStockStatus(currentStock, safetyStock) {
  return STOCK_STATUS[getStockStatusKey(currentStock, safetyStock)]
}
