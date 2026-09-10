import { useState } from 'react'
import OrderSidePanel from './OrderSidePanel'
import { COURIERS } from '../../utils/couriers'
import './InvoiceProcessPanel.css'

export default function InvoiceProcessPanel({ order, onSave, onClose }) {
  const [addressConfirmed, setAddressConfirmed] = useState(false)
  // 팀에서 실제로 CJ대한통운을 주로 쓰기 때문에 기본 선택값으로 지정.
  // 다른 택배사를 쓰는 주문이면 드롭다운에서 바꾸면 된다.
  const [courier, setCourier] = useState('CJ대한통운')
  const [courierConfirmed, setCourierConfirmed] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [printed, setPrinted] = useState(false)
  const [notice, setNotice] = useState(
    `안녕하세요, 회원님.\n이번에 구매하신 [${order.productName}]이(가) [택배사]로 발송되었으며, 영업일 기준 3일 정도 소요될 수 있습니다.\n송장번호는 [송장번호]입니다.`,
  )

  const handlePrint = () => {
    onSave({
      courier,
      trackingNumber,
      status: '발송중',
      processedBy: '관리자',
      processedAt: new Date().toISOString(),
    })
    setPrinted(true)
  }

  return (
    <OrderSidePanel order={order} title="송장 처리" onClose={onClose}>
      <section className="order-panel__section">
        <h4>송장 처리 절차</h4>
        <ol className="invoice-steps">
          <li className={addressConfirmed ? 'invoice-steps__done' : ''}>① 배송지 확인</li>
          <li className={courierConfirmed ? 'invoice-steps__done' : ''}>② 송장 확정</li>
          <li className={printed ? 'invoice-steps__done' : ''}>③ 송장 인쇄</li>
        </ol>
      </section>

      <section className="order-panel__section">
        <h5>① 배송지 확인</h5>
        <p className="order-panel__muted">
          수령인: {order.buyerName || '-'} / 연락처: {order.phone || '-'} / 주소: {order.address || '주소 정보 없음'}
        </p>
        <p className="order-panel__notice">⚠ 오배송 방지를 위해 발송 전 반드시 원본 엑셀에서 실제 주소를 확인하세요.</p>
        <button type="button" className="btn btn--ghost" onClick={() => setAddressConfirmed(true)} disabled={addressConfirmed}>
          {addressConfirmed ? '확인 완료' : '배송지 확인'}
        </button>
      </section>

      <section className="order-panel__section">
        <h5>② 송장 확정</h5>
        <label className="field-label">택배사</label>
        <select
          className="field-select invoice-steps__select"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          disabled={!addressConfirmed || courierConfirmed}
        >
          <option value="">선택</option>
          {COURIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="order-panel__muted">
          ⚠ 택배사 시스템 자동 연동은 지원하지 않습니다. 택배사 홈페이지/프로그램에서 송장번호를 발급받아
          아래 ③단계에 직접 입력해주세요.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={!addressConfirmed || !courier || courierConfirmed}
          onClick={() => setCourierConfirmed(true)}
        >
          {courierConfirmed ? '확인 완료' : '송장 확인'}
        </button>
      </section>

      <section className="order-panel__section">
        <h5>③ 송장 인쇄</h5>
        <label className="field-label">송장번호</label>
        <input
          type="text"
          className="field-input invoice-steps__select"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          disabled={!courierConfirmed || printed}
          placeholder="송장번호 입력"
        />
        <button
          type="button"
          className="btn btn--primary"
          disabled={!courierConfirmed || !trackingNumber || printed}
          onClick={handlePrint}
        >
          {printed ? '처리 완료' : '송장 인쇄'}
        </button>
        <p className="order-panel__muted">※ 송장 인쇄 시 상담관리에 교재 발송 관련 내용이 기록됩니다.</p>
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
