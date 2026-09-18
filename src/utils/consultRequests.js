// "운영↔학습팀 상담 요청" 페이지 전용 유틸.
// 기존에 구글 시트로 운영팀→학습팀에 상담을 이관하던 방식을 대체하는
// 화면이라, 시트에서 쓰던 상태값(상담대기/상담완료/부재·문자/재상담 필요)과
// 정렬 규칙(미완료 건은 항상 위, 완료 건은 아래로 가라앉음)을 그대로 따른다.

export const CONSULT_STATUS_OPTIONS = ['상담대기', '재상담 필요', '부재·문자', '상담완료']

export const CONSULT_STATUS_STYLE = {
  상담대기: { color: '#b45309', bg: '#fffbeb' },
  '재상담 필요': { color: '#dc2626', bg: '#fef2f2' },
  '부재·문자': { color: '#475569', bg: '#f1f5f9' },
  상담완료: { color: '#15803d', bg: '#f0fdf4' },
}

// 담당자가 자주 쓰는 상담유형을 등록 폼에서 바로 고를 수 있도록 제공하는
// 기본 후보 목록. "불편신고"도 상담유형 중 하나로 골라서, 상담내용을 기록할
// 때 바로 불편신고 건으로 분류할 수 있게 한다. 실제 필터 드롭다운은
// 지금까지 등록된 값에서 뽑는다.
export const CONSULT_TYPE_SUGGESTIONS = [
  '퇴사 강사 안내',
  '직원 확인 필요 회원',
  '수업 변경 요청',
  '환불/결제 문의',
  '불편신고',
  '기타',
]

export const CONSULT_TYPE_STYLE = {
  불편신고: { color: '#dc2626', bg: '#fef2f2' },
}
const DEFAULT_TYPE_STYLE = { color: '#475569', bg: '#f1f5f9' }

export function getConsultTypeStyle(consultType) {
  return CONSULT_TYPE_STYLE[consultType] || DEFAULT_TYPE_STYLE
}

// 담당자는 학습팀뿐 아니라 운영팀으로 다시 배정될 수도 있어 자유 입력을
// 막지는 않지만, 아직 직원 명단을 별도 DB에서 가져올 수 없어 자주
// 배정되는 학습팀 인원을 타이핑 후보로만 미리 채워둔다.
export const LEARNING_TEAM_MEMBERS = ['김룰루', '이학습', '최학습', '정학습']

export function isConsultResolved(status) {
  return status === '상담완료'
}

export function countPendingConsultRequests(records) {
  return records.filter((r) => !isConsultResolved(r.status)).length
}

export function getAllConsultTypes(records) {
  return [...new Set(records.map((r) => r.consultType).filter(Boolean))].sort()
}

export function getAllAssignees(records) {
  return [...new Set(records.map((r) => r.assignee).filter(Boolean))].sort()
}

// 상담 요청 등록 화면에서 회원아이디(이메일)를 입력하면, 이미 저장되어
// 있는 교재 주문/네이버 이벤트 주문 내역에서 같은 이메일을 가진 회원을
// 찾아 이름을 자동으로 채워준다. 별도 회원 DB가 없는 지금 상황에서 가장
// 가까운 "회원정보 연동" 소스가 이미 업로드된 주문 데이터이기 때문이다.
export function findMemberByIdentifier(identifier, orders = [], eventOrders = []) {
  const target = (identifier || '').trim().toLowerCase()
  if (!target) return null
  const match = [...orders, ...eventOrders].find((o) => (o.email || '').trim().toLowerCase() === target)
  if (!match) return null
  return { name: match.buyerName || '', phone: match.phone || '' }
}

export function filterConsultRequests(records, { consultType, assignee, status }) {
  return records.filter((r) => {
    if (consultType && consultType !== 'all' && r.consultType !== consultType) return false
    if (assignee && assignee !== 'all' && r.assignee !== assignee) return false
    if (status && status !== 'all' && r.status !== status) return false
    return true
  })
}

// 상담대기·재상담 필요·부재·문자 건은 항상 위, 상담완료 건만 아래로 가라앉는다.
// 미완료 건 중에서는 긴급 건을 우선하고, 그다음은 오래 기다린 순(먼저 접수된
// 순)으로 보여줘 누락 위험이 큰 건이 눈에 먼저 띄게 한다. 완료 건은 최근에
// 처리한 것이 위로 오게 정렬한다.
export function sortConsultRequests(records) {
  const pending = records.filter((r) => !isConsultResolved(r.status))
  const resolved = records.filter((r) => isConsultResolved(r.status))

  pending.sort((a, b) => {
    if (Boolean(b.urgent) !== Boolean(a.urgent)) return Boolean(b.urgent) - Boolean(a.urgent)
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  })
  resolved.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))

  return [...pending, ...resolved]
}
