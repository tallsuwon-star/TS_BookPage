import { useState } from 'react'
import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import { getDeliveryStatusStyle, getEventOrderDisplayStatus, normalizeChannel } from '../../utils/aggregation'
import { getReviewRequestMessage } from '../../utils/reviewMessages'
import Badge from '../common/Badge'
import '../orderManagement/OrderSidePanel.css'

// 이벤트 주문 1건의 상세 + "발송처리"(리뷰 요청 문자 안내) 패널.
// ⚠️ 연락처로 실제 LMS 회원을 자동으로 찾아 매칭하는 기능은 아직
// 없다(별도 LMS 연동 API가 필요) — 지금은 담당자가 직접 확인해야 한다.
export default function EventOrderDetailView({ order, shipping, onSave, onClose }) {
  const displayStatus = getEventOrderDisplayStatus(order, shipping)
  const style = getDeliveryStatusStyle(displayStatus)
  const alreadyProcessed = Boolean(shipping?.status) || Boolean(shipping?.reviewWritten)
  const [message, setMessage] = useState(shipping?.sentMessage || getReviewRequestMessage(order.eventType))

  const handleProcess = () => {
    const confirmed = window.confirm(
      '이 안내 문자를 회원에게 보내시겠습니까?\n(문자 자동 발송은 아직 연동되지 않아, 확인을 누르면 발송처리 상태로 기록되고 아래 문구는 담당자가 직접 복사해 전달해야 합니다.)',
    )
    if (!confirmed) return
    onSave({ status: '발송중', processedBy: '관리자', processedAt: new Date().toISOString(), sentMessage: message })
  }

  return (
    <aside className="order-panel">
      <div className="order-panel__header">
        <h3>이벤트 주문 상세</h3>
        <button type="button" className="order-panel__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>

      <section className="order-panel__section">
        <h4>기본 정보</h4>
        <dl className="order-panel__dl">
          <dt>주문번호</dt>
          <dd>{order.orderNumber || order.id}</dd>
          <dt>주문일시</dt>
          <dd>{formatDateDisplay(order.orderDate)}</dd>
          <dt>상품명</dt>
          <dd>{order.productName}</dd>
          <dt>수량</dt>
          <dd>{formatNumber(order.quantity)}</dd>
          <dt>구매처</dt>
          <dd>{order.channel ? normalizeChannel(order.channel) : '-'}</dd>
          <dt>구매자</dt>
          <dd>{order.buyerName || '-'}</dd>
          <dt>연락처</dt>
          <dd>{order.phone || '-'}</dd>
        </dl>
      </section>

      <section className="order-panel__section">
        <h4>처리 상태</h4>
        <p className="order-panel__muted">
          <Badge label={displayStatus} color={style.color} background={style.bg} />
        </p>
        <p className="order-panel__notice">
          ⚠ 연락처로 LMS 실제 회원을 자동으로 찾아 매칭하는 기능은 아직 연동되어 있지 않습니다. 지금은 담당자가
          연락처를 보고 LMS에서 직접 확인해주세요.
        </p>
      </section>

      <section className="order-panel__section">
        <h4>발송처리 (리뷰 요청 문자)</h4>
        <textarea
          className="order-panel__textarea"
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={alreadyProcessed}
        />
        <button type="button" className="btn btn--primary" onClick={handleProcess} disabled={alreadyProcessed}>
          {alreadyProcessed ? '처리 완료' : '발송처리'}
        </button>
      </section>
    </aside>
  )
}
