import Badge from '../common/Badge'
import { CONSULT_STATUS_OPTIONS, CONSULT_STATUS_STYLE, DEPARTMENTS, getPendingStatusCounts } from '../../utils/consultRequests'
import '../dashboard/FilterBar.css'

// 타포 실제 "상담 이관" 화면의 필터 카드(담당부서/상담유형/진행여부/검색 +
// 우측의 "대기중 요청" 배지 3개)와 구조를 맞췄다. allRecords는 필터와
// 무관하게 "전체 대기 현황" 배지를 계산하기 위한 값이다.
export default function ConsultRequestFilterBar({
  department,
  onDepartmentChange,
  consultType,
  onConsultTypeChange,
  consultTypeOptions,
  status,
  onStatusChange,
  search,
  onSearchChange,
  allRecords,
}) {
  const pendingCounts = getPendingStatusCounts(allRecords)

  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
        <div>
          <label className="field-label">담당부서</label>
          <select className="field-select" value={department} onChange={(e) => onDepartmentChange(e.target.value)}>
            <option value="all">전체</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">상담유형</label>
          <select className="field-select" value={consultType} onChange={(e) => onConsultTypeChange(e.target.value)}>
            <option value="all">전체</option>
            {consultTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">진행여부</label>
          <select className="field-select" value={status} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="all">전체</option>
            {CONSULT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">검색</label>
          <input
            type="text"
            className="field-input"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="회원명·연락처·내용"
          />
        </div>
      </div>

      <div className="filter-bar__group">
        <div>
          <label className="field-label">대기중 요청</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['상담대기', '재상담필요', '부재중'].map((s) => (
              <Badge
                key={s}
                label={`${s} ${pendingCounts[s]}`}
                color={CONSULT_STATUS_STYLE[s].color}
                background={CONSULT_STATUS_STYLE[s].bg}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
