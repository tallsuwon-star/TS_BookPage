import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../../context/DataContext'
import { CONSULT_TYPE_SUGGESTIONS, LEARNING_TEAM_MEMBERS, findMemberByIdentifier } from '../../utils/consultRequests'
import '../orderManagement/OrderSidePanel.css'

// 운영팀이 학습팀에 상담을 이관할 때 쓰는 등록 폼. 기획안의 "요청등록"
// 단계(회원검색 / 상담희망일시 / 상담유형·요청내용 / 담당자지정 /
// 긴급여부)를 그대로 옮겼고, 로그인 기능이 없는 화면이라 "작성자"(운영팀
// 담당자 이름)도 직접 입력받는다.
export default function ConsultRequestFormPanel({ onSave, onClose }) {
  const { orders, eventOrders } = useData()
  const [requestedBy, setRequestedBy] = useState('')
  const [memberName, setMemberName] = useState('')
  const [memberIdentifier, setMemberIdentifier] = useState('')
  const [consultType, setConsultType] = useState('')
  const [content, setContent] = useState('')
  const [preferredAt, setPreferredAt] = useState('')
  const [assignee, setAssignee] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [error, setError] = useState('')

  // 회원아이디(이메일)를 입력하면 이미 저장된 주문 내역에서 같은 이메일을
  // 찾아 이름을 자동으로 채운다. 사용자가 자동으로 채워진 이름을 직접
  // 고치면(=lastAutoFilledRef와 달라지면) 더 이상 덮어쓰지 않는다.
  const memberMatch = useMemo(
    () => findMemberByIdentifier(memberIdentifier, orders, eventOrders),
    [memberIdentifier, orders, eventOrders],
  )
  const lastAutoFilledRef = useRef('')
  useEffect(() => {
    if (memberMatch && (memberName === '' || memberName === lastAutoFilledRef.current)) {
      setMemberName(memberMatch.name)
      lastAutoFilledRef.current = memberMatch.name
    }
  }, [memberMatch])

  const handleSubmit = () => {
    if (!memberName.trim() || !content.trim()) {
      setError('회원이름과 상담내용은 필수 입력 항목입니다.')
      return
    }
    onSave({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      requestedBy: requestedBy.trim(),
      memberName: memberName.trim(),
      memberIdentifier: memberIdentifier.trim(),
      consultType: consultType.trim(),
      content: content.trim(),
      preferredAt,
      assignee: assignee.trim(),
      urgent,
      status: '상담대기',
      resultNote: '',
      nextConsultAt: '',
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <aside className="order-panel">
      <div className="order-panel__header">
        <h3>상담 요청 등록</h3>
        <button type="button" className="order-panel__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>

      <section className="order-panel__section">
        <h4>작성 정보</h4>
        <label className="field-label">작성자(운영팀 담당자)</label>
        <input
          type="text"
          className="field-input"
          style={{ width: '100%', marginBottom: 10 }}
          value={requestedBy}
          onChange={(e) => setRequestedBy(e.target.value)}
          placeholder="예: 박지호"
        />
      </section>

      <section className="order-panel__section">
        <h4>회원 검색</h4>
        <label className="field-label">회원아이디(이메일)</label>
        <input
          type="text"
          className="field-input"
          style={{ width: '100%' }}
          value={memberIdentifier}
          onChange={(e) => setMemberIdentifier(e.target.value)}
          placeholder="예: pianist6478@gmail.com"
        />
        {memberIdentifier.trim() && (
          <p className="order-panel__muted" style={{ margin: '4px 0 10px' }}>
            {memberMatch
              ? `✅ 주문 내역에서 확인됨: ${memberMatch.name || '(이름 없음)'}`
              : '주문 내역에서 일치하는 회원을 찾지 못했습니다. 이름을 직접 입력해주세요.'}
          </p>
        )}
        <label className="field-label">회원이름</label>
        <input
          type="text"
          className="field-input"
          style={{ width: '100%' }}
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          placeholder="예: 김하늘"
        />
      </section>

      <section className="order-panel__section">
        <h4>상담 내용</h4>
        <label className="field-label">상담유형</label>
        <input
          type="text"
          className="field-input"
          style={{ width: '100%', marginBottom: 10 }}
          list="consult-type-suggestions"
          value={consultType}
          onChange={(e) => setConsultType(e.target.value)}
          placeholder="예: 퇴사 강사 안내"
        />
        <datalist id="consult-type-suggestions">
          {CONSULT_TYPE_SUGGESTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>

        <label className="field-label">상담 희망일</label>
        <input
          type="date"
          className="field-input"
          style={{ width: '100%', marginBottom: 10 }}
          value={preferredAt}
          onChange={(e) => setPreferredAt(e.target.value)}
        />

        <label className="field-label">요청 내용</label>
        <textarea
          className="order-panel__textarea"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="상담 요청 원문을 입력해주세요"
        />
      </section>

      <section className="order-panel__section">
        <h4>배정</h4>
        <label className="field-label">담당자 지정 (지정 시 톡톡으로 발송됩니다)</label>
        <input
          type="text"
          className="field-input"
          style={{ width: '100%', marginBottom: 10 }}
          list="learning-team-members"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="담당자 이름을 입력하거나 선택하세요"
        />
        <datalist id="learning-team-members">
          {LEARNING_TEAM_MEMBERS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
          긴급 요청
        </label>
      </section>

      {error && <p className="order-panel__notice">{error}</p>}

      <button type="button" className="btn btn--primary" onClick={handleSubmit}>
        등록
      </button>
    </aside>
  )
}
