export function formatNumber(value) {
  const num = Number(value) || 0
  return num.toLocaleString('ko-KR')
}

export function formatCurrency(value) {
  return `${formatNumber(value)}원`
}

export function formatPercent(value, digits = 1) {
  const num = Number(value) || 0
  return `${num.toFixed(digits)}%`
}
