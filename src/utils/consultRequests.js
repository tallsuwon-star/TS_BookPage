// "운영↔학습팀 상담 요청" 페이지 전용 유틸.
// 2026-09-29에 실제 타포(oper, Laravel/Blade) "상담 이관"
// (/admin/consult-handoffs) 화면의 실제 소스를 확인해서, 상태값/상담유형/
// 담당부서/정렬 규칙을 그 화면과 1:1로 맞췄다.

export const CONSULT_STATUS_OPTIONS = ['상담대기', '재상담필요', '부재중', '상담완료']

// 타포 실제 화면의 배지 색(Tailwind red/amber/purple/blue-50·600)을 그대로 옮김.
export const CONSULT_STATUS_STYLE = {
  상담대기: { color: '#dc2626', bg: '#fef2f2' },
  재상담필요: { color: '#d97706', bg: '#fffbeb' },
  부재중: { color: '#9333ea', bg: '#faf5ff' },
  상담완료: { color: '#2563eb', bg: '#eff6ff' },
}

export const DEPARTMENTS = ['운영팀', '학습팀']

// 타포 "상담 이관" 필터의 상담유형 12개 항목을 그대로 옮겼다. 담당부서별로
// 나눠서, 등록 폼에서 담당부서를 고르면 그 부서의 유형만 고를 수 있게 한다.
export const CONSULT_TYPES_BY_DEPARTMENT = {
  운영팀: ['미납 문의', '이벤트 상담', '결제 오류·결제 내역 확인', '수업 일정·수강 기간 조정', '재수강·수강 연장 문의', '기타 운영 상담'],
  학습팀: ['강사 변경·강사 추천', '강사 퇴사 후 재배정 상담', '교재 변경·커리큘럼 상담', '수업 난이도 조정', '레벨·학습방향 상담', '기타 학습 상담'],
}

export const CONSULT_TYPE_SUGGESTIONS = [
  ...CONSULT_TYPES_BY_DEPARTMENT.운영팀,
  ...CONSULT_TYPES_BY_DEPARTMENT.학습팀,
]

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

// 타포 필터 상단의 "대기중 요청" 배지 3개(상담대기/재상담필요/부재중)와
// 같은 값. 지금 보고 있는 필터 결과가 아니라 전체 건수를 기준으로 한다 —
// 필터를 걸어도 "전체 대기 현황"은 바뀌면 안 되기 때문이다.
export function getPendingStatusCounts(records) {
  const counts = { 상담대기: 0, 재상담필요: 0, 부재중: 0 }
  for (const r of records) {
    if (counts[r.status] !== undefined) counts[r.status] += 1
  }
  return counts
}

export function getAllConsultTypes(records) {
  return [...new Set(records.map((r) => r.consultType).filter(Boolean))].sort()
}

export function getAllAssignees(records) {
  return [...new Set(records.map((r) => r.assignee).filter(Boolean))].sort()
}

// 상담 요청 등록 화면에서 연락처(전화번호)를 입력하면, 이미 저장되어 있는
// 교재 주문/네이버 이벤트 주문 내역에서 같은 연락처를 가진 회원을 찾아
// 이름을 자동으로 채워준다(타포의 "회원정보"도 이름+연락처 기준이다).
// 별도 회원 DB가 없는 지금 상황에서 가장 가까운 "회원정보 연동" 소스가
// 이미 업로드된 주문 데이터이기 때문이다.
export function findMemberByIdentifier(phone, orders = [], eventOrders = []) {
  const target = (phone || '').trim()
  if (!target) return null
  const match = [...orders, ...eventOrders].find((o) => (o.phone || '').trim() === target)
  if (!match) return null
  return { name: match.buyerName || '', phone: match.phone || '' }
}

export function filterConsultRequests(records, { consultType, assignee, status, department, search }) {
  const keyword = (search || '').trim().toLowerCase()
  return records.filter((r) => {
    if (consultType && consultType !== 'all' && r.consultType !== consultType) return false
    if (assignee && assignee !== 'all' && r.assignee !== assignee) return false
    if (status && status !== 'all' && r.status !== status) return false
    if (department && department !== 'all' && r.department !== department) return false
    if (keyword) {
      const haystack = `${r.memberName || ''} ${r.memberIdentifier || ''} ${r.content || ''}`.toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })
}

// 상담대기·재상담필요·부재중 건은 항상 위, 상담완료 건만 아래로 가라앉는다.
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

// 타포 실제 화면의 "MM/DD HH:mm" 표시 형식과 맞춘다.
export function formatShortDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
