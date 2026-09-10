import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import './OrderSidePanel.css'

// ⚠️ 개인정보 보호를 위해 주문자 이름/이메일/연락처/배송지 주소는 애초에
// 엑셀에서 읽어들이지 않는다(columnAliases.js 참고). 실제 배송 업무에는
// 필요하지만, 이 값들을 공유 저장소(data.json)에 저장하는 순간 개인정보를
// 외부에 노출하는 셈이라 이 화면에는 자리만 만들어두고 값은 표시하지 않는다.
const PII_PLACEHOLDER = '비공개 (개인정보 보호)'

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
          <dd>{order.id}</dd>
          <dt>주문일시</dt>
          <dd>{formatDateDisplay(order.orderDate)}</dd>
          <dt>주문자</dt>
          <dd>{PII_PLACEHOLDER}</dd>
          <dt>E-mail</dt>
          <dd>{PII_PLACEHOLDER}</dd>
          <dt>연락처</dt>
          <dd>{PII_PLACEHOLDER}</dd>
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
