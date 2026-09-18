import { CONSULT_STATUS_OPTIONS } from '../../utils/consultRequests'
import '../dashboard/FilterBar.css'

export default function ConsultRequestFilterBar({
  consultType,
  onConsultTypeChange,
  consultTypeOptions,
  assignee,
  onAssigneeChange,
  assigneeOptions,
  status,
  onStatusChange,
  onOpenForm,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
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
          <label className="field-label">담당자</label>
          <select className="field-select" value={assignee} onChange={(e) => onAssigneeChange(e.target.value)}>
            <option value="all">전체</option>
            {assigneeOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">상태</label>
          <select className="field-select" value={status} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="all">전체</option>
            {CONSULT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-bar__group">
        <button type="button" className="btn btn--primary" onClick={onOpenForm}>
          + 상담 요청 등록
        </button>
      </div>
    </div>
  )
}
