// 날짜 관련 공통 유틸. 엑셀에서 읽은 값은 Date 객체, 문자열, 숫자 등
// 다양한 형태로 들어올 수 있어 항상 이 함수들을 거쳐 'YYYY-MM-DD' 문자열로 통일한다.

const pad2 = (n) => String(n).padStart(2, '0')

export function toISODate(value) {
  if (!value) return ''
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`
  }
  if (typeof value === 'number') {
    // 엑셀 직렬 날짜(1900 날짜 체계) 방어적 처리
    const excelEpoch = new Date(Date.UTC(1899, 11, 30))
    const date = new Date(excelEpoch.getTime() + value * 86400000)
    return toISODate(date)
  }
  const str = String(value).trim()
  const match = str.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/)
  if (match) {
    const [, y, m, d] = match
    return `${y}-${pad2(m)}-${pad2(d)}`
  }
  return ''
}

export function todayISO() {
  return toISODate(new Date())
}

export function firstDayOfMonthISO() {
  const now = new Date()
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
}

export function isWithinRange(dateISO, startISO, endISO) {
  if (!dateISO) return false
  if (startISO && dateISO < startISO) return false
  if (endISO && dateISO > endISO) return false
  return true
}

export function defaultDateRange() {
  return { startDate: firstDayOfMonthISO(), endDate: todayISO() }
}

export function formatDateDisplay(dateISO) {
  if (!dateISO) return '-'
  const [y, m, d] = dateISO.split('-')
  return `${y}.${m}.${d}`
}
