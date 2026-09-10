import { useState } from 'react'
import OrderSidePanel from './OrderSidePanel'

export default function OrderDetailView({ order, shipping, onUpdateStatus, onClose }) {
  const [status, setStatus] = useState(shipping?.status || order.deliveryStatus || '준비')
  const [notice, setNotice] = useState(
    `안녕하세요, 회원님.\n이번에 구매하신 [${order.productName}]이(가) ${shipping?.courier || '[택배사]'}(으)로 발송되었으며, 영업일 기준 3일 정도 소요될 수 있습니다.\n송장번호는 ${shipping?.trackingNumber || '[송장번호]'}입니다.`,
  )

  return (
    <OrderSidePanel order={order} title="주문 상세" onClose={onClose}>
      <section className="order-panel__section">
        <h4>배송정보</h4>
        <dl className="order-panel__dl">
          <dt>택배사</dt>
          <dd>{shipping?.courier || '미처리'}</dd>
          <dt>송장번호</dt>
          <dd>{shipping?.trackingNumber || '-'}</dd>
          <dt>배송상태</dt>
          <dd>
            <select
              className="field-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                onUpdateStatus(e.target.value)
              }}
            >
              <option value="준비">준비</option>
              <option value="발송중">발송중</option>
              <option value="취소">취소</option>
            </select>
          </dd>
          <dt>처리자</dt>
          <dd>{shipping?.processedBy || '-'}</dd>
          <dt>처리일시</dt>
          <dd>{shipping?.processedAt ? new Date(shipping.processedAt).toLocaleString('ko-KR') : '-'}</dd>
        </dl>
      </section>

      <section className="order-panel__section">
        <h4>회원 안내</h4>
        <textarea
          className="order-panel__textarea"
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          rows={5}
        />
        <button
          type="button"
          className="btn btn--primary"
          onClick={() =>
            window.alert('문자/이메일 자동 발송은 아직 연동되지 않았습니다. 안내 문구를 복사해 직접 전달해주세요.')
          }
        >
          안내 발송
        </button>
      </section>
    </OrderSidePanel>
  )
}
