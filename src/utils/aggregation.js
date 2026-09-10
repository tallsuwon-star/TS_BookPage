import { isWithinRange } from './dateUtils'
import { classifyBookCategory } from './columnAliases'

// 네이버 배송상태 값은 셀러 설정에 따라 조금씩 다르게 표기될 수 있어
// 포함 여부(includes) 기준으로 판정한다.
const CANCELLED_KEYWORDS = ['취소', '반품', '교환', '환불']
const SHIPPED_KEYWORDS = ['배송중', '배송완료', '구매확정', '발송완료', '배송지연', '발송중']

export function isCancelledStatus(status) {
  const str = String(status || '')
  return CANCELLED_KEYWORDS.some((k) => str.includes(k))
}

// '출고'된 것으로 간주할 주문: 취소/반품 건은 제외하고, 실제 배송이
// 시작되었거나 완료된 상태만 집계한다.
export function isShippedStatus(status) {
  if (isCancelledStatus(status)) return false
  const str = String(status || '')
  return SHIPPED_KEYWORDS.some((k) => str.includes(k))
}

// 배송상태를 한눈에 구분할 수 있도록 색을 입힌다: 발송대기(빨강) /
// 발송중·발송완료(연두) / 취소·반품(회색).
export function getDeliveryStatusStyle(status) {
  if (isCancelledStatus(status)) return { color: '#64748b', bg: '#f1f5f9' }
  if (isShippedStatus(status)) return { color: '#4d7c0f', bg: '#f7fee7' }
  return { color: '#dc2626', bg: '#fef2f2' }
}

// 판매채널 원본 값(스마트스토어, 자사몰 등)은 셀러/파일마다 표기가 제각각이라
// "네이버쇼핑 / 토크스테이션 / 기타" 3가지로 고정해서 보여주고 필터링한다.
export const CHANNEL_BUCKETS = ['네이버쇼핑', '토크스테이션', '기타']

export function normalizeChannel(rawChannel) {
  const str = String(rawChannel || '')
  if (str.includes('네이버') || str.includes('스마트스토어')) return '네이버쇼핑'
  if (str.includes('토크스테이션') || str.includes('톡스') || str.includes('자사몰')) return '토크스테이션'
  return '기타'
}

export function filterOrders(orders, { startDate, endDate, channel, category, deliveryStatus } = {}) {
  return orders.filter((order) => {
    if (!isWithinRange(order.orderDate, startDate, endDate)) return false
    if (channel && channel !== 'all' && normalizeChannel(order.channel) !== channel) return false
    if (deliveryStatus && deliveryStatus !== 'all' && order.deliveryStatus !== deliveryStatus) return false
    if (category && category !== 'all' && classifyBookCategory(order.productName) !== category) return false
    return true
  })
}

export function computeSummary(filteredOrders) {
  let orderAmount = 0
  let shippedQty = 0
  for (const order of filteredOrders) {
    orderAmount += (Number(order.quantity) || 0) * (Number(order.price) || 0)
    if (isShippedStatus(order.deliveryStatus)) {
      shippedQty += Number(order.quantity) || 0
    }
  }
  return {
    orderCount: filteredOrders.length,
    orderAmount,
    shippedQty,
  }
}

export function aggregateByBook(filteredOrders) {
  const map = new Map()
  for (const order of filteredOrders) {
    const key = order.productName || '(상품명 없음)'
    if (!map.has(key)) {
      map.set(key, { productName: key, orderCount: 0, orderQty: 0, orderAmount: 0 })
    }
    const entry = map.get(key)
    entry.orderCount += 1
    entry.orderQty += Number(order.quantity) || 0
    entry.orderAmount += (Number(order.quantity) || 0) * (Number(order.price) || 0)
  }
  const totalAmount = Array.from(map.values()).reduce((sum, e) => sum + e.orderAmount, 0)
  return Array.from(map.values()).map((entry) => ({
    ...entry,
    ratio: totalAmount > 0 ? (entry.orderAmount / totalAmount) * 100 : 0,
  }))
}

export function sortBooks(books, sortKey) {
  const sorted = [...books]
  switch (sortKey) {
    case 'orderQty':
      sorted.sort((a, b) => b.orderQty - a.orderQty)
      break
    case 'orderAmount':
      sorted.sort((a, b) => b.orderAmount - a.orderAmount)
      break
    case 'orderCount':
    default:
      sorted.sort((a, b) => b.orderCount - a.orderCount)
      break
  }
  return sorted
}

export function computeShippedQtyByBook(filteredOrders) {
  const map = new Map()
  for (const order of filteredOrders) {
    if (!isShippedStatus(order.deliveryStatus)) continue
    const key = order.productName || '(상품명 없음)'
    map.set(key, (map.get(key) || 0) + (Number(order.quantity) || 0))
  }
  return map
}

// 도넛차트용 채널별 집계. 판매채널 값이 전혀 없으면 빈 배열을 반환해
// 카드 자체를 숨길 수 있도록 한다.
export function computeChannelBreakdown(filteredOrders) {
  const map = new Map()
  for (const order of filteredOrders) {
    if (!order.channel) continue
    const channel = normalizeChannel(order.channel)
    map.set(channel, (map.get(channel) || 0) + 1)
  }
  return Array.from(map.entries()).map(([channel, count]) => ({ channel, count }))
}

export function getAllProductNames(orders, inventory) {
  const names = new Set()
  for (const order of orders) {
    if (order.productName) names.add(order.productName)
  }
  for (const name of Object.keys(inventory || {})) {
    names.add(name)
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'ko'))
}

export function getAllDeliveryStatuses(orders) {
  const set = new Set()
  for (const order of orders) {
    if (order.deliveryStatus) set.add(order.deliveryStatus)
  }
  return Array.from(set)
}

// --- 주문취소/반품관리 ---

export function filterCancelReturns(records, { startDate, endDate, claimType, channel } = {}) {
  return records.filter((r) => {
    if (!isWithinRange(r.claimDate, startDate, endDate)) return false
    if (claimType && claimType !== 'all' && r.claimType !== claimType) return false
    if (channel && channel !== 'all' && normalizeChannel(r.channel) !== channel) return false
    return true
  })
}

export function computeCancelReturnSummary(filteredRecords) {
  const byType = new Map()
  let totalQty = 0
  for (const r of filteredRecords) {
    const type = r.claimType || '미지정'
    byType.set(type, (byType.get(type) || 0) + 1)
    totalQty += Number(r.quantity) || 0
  }
  return {
    totalCount: filteredRecords.length,
    totalQty,
    byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })),
  }
}

export function aggregateCancelReturnsByBook(filteredRecords) {
  const map = new Map()
  for (const r of filteredRecords) {
    const key = r.productName || '(상품명 없음)'
    if (!map.has(key)) map.set(key, { productName: key, count: 0, qty: 0 })
    const entry = map.get(key)
    entry.count += 1
    entry.qty += Number(r.quantity) || 0
  }
  const total = filteredRecords.length
  return Array.from(map.values()).map((entry) => ({
    ...entry,
    ratio: total > 0 ? (entry.count / total) * 100 : 0,
  }))
}

export function sortCancelReturnBooks(list, sortKey) {
  const sorted = [...list]
  if (sortKey === 'qty') sorted.sort((a, b) => b.qty - a.qty)
  else sorted.sort((a, b) => b.count - a.count)
  return sorted
}

// 취소/반품 목록에서 아직 처리 안 된 건이 위에 남아있고, 처리된 건은
// 아래로 내려가도록 정렬할 때 쓰는 판정 기준.
const CANCEL_PROCESSED_KEYWORDS = ['완료', '승인', '환불완료', '처리완료']

export function isCancelProcessed(status) {
  return CANCEL_PROCESSED_KEYWORDS.some((k) => String(status || '').includes(k))
}

export function getAllClaimTypes(records) {
  const set = new Set()
  for (const r of records) {
    if (r.claimType) set.add(r.claimType)
  }
  return Array.from(set)
}

// 발주발송관리(주문) 파일의 배송상태 열에 "취소"/"취소요청" 등이 그대로 찍혀
// 내려오는 경우가 있어, 별도의 "취소/반품/교환 관리" 파일을 올리지 않아도
// 자동으로 "주문취소/반품관리" 화면에 잡히도록 한다. (반품/교환/환불은 보통
// 전용 파일에서만 확인 가능해 여기서는 "취소" 키워드만 감지한다.)
export function isCancelRequestStatus(status) {
  return String(status || '').includes('취소')
}

export function extractCancelledFromOrders(orders) {
  return orders
    .filter((order) => isCancelRequestStatus(order.deliveryStatus))
    .map((order) => ({
      id: `auto-${order.id}`,
      claimDate: order.orderDate,
      productName: order.productName,
      quantity: order.quantity,
      claimType: '취소',
      reason: '-',
      status: order.deliveryStatus,
      channel: order.channel,
      source: 'order-file',
    }))
}
