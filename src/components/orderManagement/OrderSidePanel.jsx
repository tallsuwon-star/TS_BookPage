import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import './OrderSidePanel.css'

// ⚠️ 팀 확인 결과(2026-09-10) 실제 업로드하는 파일은 항상 사전에 가명·임의
// 연락처로 치환해둔 파일이라 실제 회원 개인정보가 아니므로, 주문자명/이메일/
// 연락처/주문번호/주소를 마스킹 없이 그대로 표시한다.
export default function OrderSidePanel({ order, title, onClose, children }) {
  return (
    <aside className="order-panel">
      <div className="order-panel__header">
        <h3>{title}</h3>
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
          <dt>주문자</dt>
          <dd>{order.buyerName || '-'}</dd>
          <dt>E-mail</dt>
          <dd>{order.email || '-'}</dd>
          <dt>연락처</dt>
          <dd>{order.phone || '-'}</dd>
          <dt>주소</dt>
          <dd>{order.address || '-'}</dd>
        </dl>
      </section>

      <section className="order-panel__section">
        <h4>주문정보</h4>
        <dl className="order-panel__dl">
          <dt>구매처</dt>
          <dd>{order.channel || '-'}</dd>
          <dt>교재명</dt>
          <dd>{order.productName}</dd>
          <dt>결제방법</dt>
          <dd>- (엑셀에 없는 항목)</dd>
          <dt>결제금액</dt>
          <dd>{formatNumber((Number(order.quantity) || 0) * (Number(order.price) || 0))}원</dd>
        </dl>
      </section>

      {children}
    </aside>
  )
}
