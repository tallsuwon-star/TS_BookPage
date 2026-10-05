import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import Card from '../../components/common/Card'
import ConsultRequestFilterBar from '../../components/consultRequest/ConsultRequestFilterBar'
import ConsultRequestListTable from '../../components/consultRequest/ConsultRequestListTable'
import ConsultRequestFormPanel from '../../components/consultRequest/ConsultRequestFormPanel'
import ConsultRequestDetailPanel from '../../components/consultRequest/ConsultRequestDetailPanel'
import { MANAGER_NAMES, filterConsultRequests, getAllConsultTypes } from '../../utils/consultRequests'
import '../DashboardPage/DashboardPage.css'
import '../OrderManagementPage/OrderManagementPage.css'

// 운영팀↔학습팀 상담 이관을 구글 시트 대신 이 화면에서 처리한다.
// 요청 등록(운영팀) → 담당자 배정 → 상담 진행 → 결과 기록 → 양팀이
// 같은 화면에서 이력 확인, 이 흐름을 하나의 목록 + 등록/상세 패널로 구현했다.
// 2026-09-29에 실제 타포(oper) "상담 이관" 화면 소스를 확인해서 구조를
// 1:1로 맞췄다(담당부서/검색 필터, 대기 상태별 배지, 자동배정 버튼 등).
export default function ConsultRequestPage() {
  const { consultRequests, addConsultRequest, updateConsultRequest, bulkUpdateConsultRequests, loading } = useData()

  const [department, setDepartment] = useState('all')
  const [consultType, setConsultType] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState(null) // { type: 'form' } | { type: 'detail', record } | null

  const consultTypeOptions = useMemo(() => getAllConsultTypes(consultRequests), [consultRequests])

  const filteredRecords = useMemo(
    () => filterConsultRequests(consultRequests, { consultType, status, department, search }),
    [consultRequests, consultType, status, department, search],
  )

  // 상세 패널을 열어둔 채로 저장하면 목록의 최신 값을 계속 봐야 하므로,
  // consultRequests가 갱신될 때마다 패널에 표시 중인 레코드도 함께 갱신한다.
  const activeDetailRecord =
    panel?.type === 'detail' ? consultRequests.find((r) => r.id === panel.record.id) || panel.record : null

  // 타포의 "상담대기 담당매니저 자동배정" 버튼과 같은 기능. 실제 배정
  // 규칙(누구에게 어떤 기준으로 배정하는지)은 화면만으로는 알 수 없어,
  // 담당자가 아직 없는 상담대기 건을 실제 매니저 명단에 라운드로빈으로
  // 임시 배정하는 방식으로 구현했다 — 실제 규칙이 정해지면 교체할 것.
  const handleAutoAssign = () => {
    const targets = consultRequests.filter((r) => r.status === '상담대기' && !r.assignee)
    if (targets.length === 0) {
      window.alert('자동 배정할 상담대기 건이 없습니다(이미 담당자가 없는 상담대기 건이 없음).')
      return
    }
    if (!window.confirm(`담당자가 없는 상담대기 ${targets.length}건을 자동 배정합니다. 계속할까요?`)) return
    const patchesById = {}
    targets.forEach((r, idx) => {
      patchesById[r.id] = { assignee: MANAGER_NAMES[idx % MANAGER_NAMES.length] }
    })
    bulkUpdateConsultRequests(patchesById)
  }

  if (loading) {
    return <div className="dashboard-page__loading">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">운영팀/학습팀 상담 이관</h1>

      <div style={{ marginBottom: 20 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              운영팀 ↔ 학습팀 상담 이관 요청을 한 화면에서 등록·배정·처리합니다.
            </span>
            <button type="button" className="btn btn--primary" onClick={() => setPanel({ type: 'form' })}>
              + 상담 이관 등록
            </button>
          </div>
        </Card>
      </div>

      <ConsultRequestFilterBar
        department={department}
        onDepartmentChange={setDepartment}
        consultType={consultType}
        onConsultTypeChange={setConsultType}
        consultTypeOptions={consultTypeOptions}
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        allRecords={consultRequests}
      />

      <div className="order-management__body">
        <div className="order-management__table">
          <ConsultRequestListTable
            records={filteredRecords}
            onOpenDetail={(record) => setPanel({ type: 'detail', record })}
            onAutoAssign={handleAutoAssign}
          />
        </div>

        {panel?.type === 'form' && (
          <ConsultRequestFormPanel
            onClose={() => setPanel(null)}
            onSave={async (record) => {
              await addConsultRequest(record)
              setPanel(null)
            }}
          />
        )}
        {panel?.type === 'detail' && activeDetailRecord && (
          <ConsultRequestDetailPanel
            record={activeDetailRecord}
            onClose={() => setPanel(null)}
            onSave={(patch) => updateConsultRequest(activeDetailRecord.id, patch)}
          />
        )}
      </div>
    </div>
  )
}
