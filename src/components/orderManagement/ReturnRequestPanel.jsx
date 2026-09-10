import { useState } from 'react'
import OrderSidePanel from './OrderSidePanel'
import AddressSearchField from '../common/AddressSearchField'
import { COURIERS } from '../../utils/couriers'
import './InvoiceProcessPanel.css'

// 회원이 주문 당시 남긴 이름/연락처/주소를 기본값으로 채워두고("자동 기입"),
// 담당자가 반품 접수를 위해 회원과 통화했을 때 다른 주소로 회수해야 하는
// 경우가 있어 "정보 수정" 버튼으로 연락처/주소만 바꿀 수 있게 한다. 접수를
// 완료하면 shippingInfo에 returnStatus: '수거중'을 기록해 목록 화면에 바로
// 반영되도록 한다.
export default function ReturnRequestPanel({ order, onSave, onClose }) {
  const [reason, setReason] = useState('')
  const [courier, setCourier] = useState('CJ대한통운')
  const [editingContact, setEditingContact] = useState(false)
  const [phone, setPhone] = useState(order.phone || '')
  const [roadAddress, setRoadAddress] = useState(order.address || '')
  const [detailAddress, setDetailAddress] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const addressDisplay = [roadAddress, detailAddress].filter(Boolean).join(' ') || '주소 정보 없음'

  const handleSubmit = () => {
    onSave({
      returnReason: reason,
      returnCourier: courier,
      returnPhone: phone,
      returnAddress: `${roadAddress} ${detailAddress}`.trim(),
      returnStatus: '수거중',
      returnProcessedBy: '관리자',
      returnRequestedAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  return (
    <OrderSidePanel order={order} title="반품 접수" onClose={onClose}>
      <section className="order-panel__section">
        <h4>회수 정보</h4>
        <p className="order-panel__muted">
          수취인: {order.buyerName || '-'}
          {!submitted && (
            <button
              type="button"
              className="btn btn--ghost btn--table-action"
              style={{ marginLeft: 8 }}
              onClick={() => setEditingContact((v) => !v)}
            >
              {editingContact ? '수정 완료' : '정보 수정'}
            </button>
          )}
        </p>

        {editingContact ? (
          <>
            <label className="field-label">연락처</label>
            <input
              type="text"
              className="field-input invoice-steps__select"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label className="field-label">회수 주소</label>
            <AddressSearchField
              roadAddress={roadAddress}
              detailAddress={detailAddress}
              onChangeRoadAddress={setRoadAddress}
              onChangeDetailAddress={setDetailAddress}
            />
          </>
        ) : (
          <p className="order-panel__muted">
            연락처: {phone || '-'} / 주소: {addressDisplay}
          </p>
        )}
      </section>

      <section className="order-panel__section">
        <h5>회수 택배사</h5>
        <select
          className="field-select invoice-steps__select"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          disabled={submitted}
        >
          {COURIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      <section className="order-panel__section">
        <h5>반품 사유</h5>
        <textarea
          className="order-panel__textarea"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="담당자가 확인한 반품 사유를 기록해주세요"
          disabled={submitted}
        />
      </section>

      <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={submitted}>
        {submitted ? '접수 완료 (수거중)' : '반품 접수'}
      </button>
    </OrderSidePanel>
  )
}
