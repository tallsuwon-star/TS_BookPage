import { useState } from 'react'
import { CONSULT_STATUS_OPTIONS } from '../../utils/consultRequests'
import '../orderManagement/OrderSidePanel.css'

// 기획안의 "상담상세" 화면: 회원 기본정보/요청 원문은 그대로 보여주고,
// 담당자·상태·상담결과·재상담예정일만 학습팀이 상담 후 채워 넣는다.
export default function ConsultRequestDetailPanel({ record, onSave, onClose }) {
  const [assignee, setAssignee] = useState(record.assignee || '')
  const [status, setStatus] = useState(record.status || '상담대기')
  const [resultNote, setResultNote] = useState(record.resultNote || '')
  const [nextConsultAt, setNextConsultAt] = useState(record.nextConsultAt || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave({ assignee: assignee.trim(), status, resultNote: resultNote.trim(), nextConsultAt })
    setSaved(true)
  }

  return (
    <aside className="order-panel">
      <div className="order-panel__header">
        <h3>상담 요청 상세</h3>
        <button type="button" className="order-panel__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>

      <section className="order-panel__section">
        <h4>회원 기본정보</h4>
        <dl className="order-panel__dl">
          <dt>회원이름</dt>
          <dd>{record.memberName || '-'}</dd>
          <dt>회원아이디</dt>
          <dd>{record.memberIdentifier || '-'}</dd>
          <dt>작성자</dt>
          <dd>{record.requestedBy || '-'}</dd>
          <dt>요청일시</dt>
          <dd>{record.createdAt ? new Date(record.createdAt).toLocaleString('ko-KR') : '-'}</dd>
          <dt>희망일시</dt>
          <dd>{record.preferredAt ? new Date(record.preferredAt).toLocaleString('ko-KR') : '-'}</dd>
          <dt>상담유형</dt>
          <dd>
            {record.consultType || '미지정'}
            {record.urgent && <span className="data-table__tag">긴급</span>}
          </dd>
        </dl>
      </section>

      <section className="order-panel__section">
        <h4>요청 원문</h4>
        <p className="order-panel__muted" style={{ whiteSpace: 'pre-wrap' }}>
          {record.content || '-'}
        </p>
      </section>

      <section className="order-panel__section">
        <h4>담당자 / 상태 변경</h4>
        <label className="field-label">담당자(학습팀)</label>
        <input
          type="text"
          className="field-input"
          style={{ width: '100%', marginBottom: 10 }}
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
        <label className="field-label">진행상태</label>
        <select
          className="field-select"
          style={{ width: '100%' }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {CONSULT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </section>

      <section className="order-panel__section">
        <h4>상담 결과 기록</h4>
        <textarea
          className="order-panel__textarea"
          rows={4}
          value={resultNote}
          onChange={(e) => setResultNote(e.target.value)}
          placeholder="상담 결과, 부재 안내 여부 등을 기록해주세요"
        />
        <label className="field-label">재상담 예정일</label>
        <input
          type="date"
          className="field-input"
          style={{ width: '100%' }}
          value={nextConsultAt}
          onChange={(e) => setNextConsultAt(e.target.value)}
        />
      </section>

      <button type="button" className="btn btn--primary" onClick={handleSave}>
        {saved ? '저장됨 · 다시 저장' : '저장'}
      </button>
    </aside>
  )
}
