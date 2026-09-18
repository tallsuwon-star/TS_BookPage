import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import ConsultRequestFilterBar from '../../components/consultRequest/ConsultRequestFilterBar'
import ConsultRequestListTable from '../../components/consultRequest/ConsultRequestListTable'
import ConsultRequestFormPanel from '../../components/consultRequest/ConsultRequestFormPanel'
import ConsultRequestDetailPanel from '../../components/consultRequest/ConsultRequestDetailPanel'
import { filterConsultRequests, getAllAssignees, getAllConsultTypes } from '../../utils/consultRequests'
import '../DashboardPage/DashboardPage.css'
import '../OrderManagementPage/OrderManagementPage.css'

// 운영팀↔학습팀 상담 이관을 구글 시트 대신 이 화면에서 처리한다.
// 요청 등록(운영팀) → 담당자 배정 → 상담 진행 → 결과 기록 → 양팀이
// 같은 화면에서 이력 확인, 이 흐름을 하나의 목록 + 등록/상세 패널로 구현했다.
export default function ConsultRequestPage() {
  const { consultRequests, addConsultRequest, updateConsultRequest, loading } = useData()

  const [consultType, setConsultType] = useState('all')
  const [assignee, setAssignee] = useState('all')
  const [status, setStatus] = useState('all')
  const [panel, setPanel] = useState(null) // { type: 'form' } | { type: 'detail', record } | null

  const consultTypeOptions = useMemo(() => getAllConsultTypes(consultRequests), [consultRequests])
  const assigneeOptions = useMemo(() => getAllAssignees(consultRequests), [consultRequests])

  const filteredRecords = useMemo(
    () => filterConsultRequests(consultRequests, { consultType, assignee, status }),
    [consultRequests, consultType, assignee, status],
  )

  // 상세 패널을 열어둔 채로 저장하면 목록의 최신 값을 계속 봐야 하므로,
  // consultRequests가 갱신될 때마다 패널에 표시 중인 레코드도 함께 갱신한다.
  const activeDetailRecord =
    panel?.type === 'detail' ? consultRequests.find((r) => r.id === panel.record.id) || panel.record : null

  if (loading) {
    return <div className="dashboard-page__loading">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">운영팀/학습팀 상담 이관</h1>
      <ConsultRequestFilterBar
        consultType={consultType}
        onConsultTypeChange={setConsultType}
        consultTypeOptions={consultTypeOptions}
        assignee={assignee}
        onAssigneeChange={setAssignee}
        assigneeOptions={assigneeOptions}
        status={status}
        onStatusChange={setStatus}
        onOpenForm={() => setPanel({ type: 'form' })}
      />

      <div className="order-management__body">
        <div className="order-management__table">
          <ConsultRequestListTable records={filteredRecords} onOpenDetail={(record) => setPanel({ type: 'detail', record })} />
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
