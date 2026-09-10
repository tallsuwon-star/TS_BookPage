import { useState } from 'react'
import './LossEntryModal.css'

export default function LossEntryModal({ productName, onSave, onCancel }) {
  const [qty, setQty] = useState('1')

  const handleSave = () => {
    const num = Number(qty)
    if (!num || num <= 0) return
    onSave(num)
  }

  return (
    <div className="loss-modal__backdrop" role="dialog" aria-modal="true">
      <div className="loss-modal">
        <h3>망실 처리</h3>
        <p className="loss-modal__desc">
          <strong>{productName}</strong> 중 분실·파손 등으로 더 이상 판매할 수 없게 된 수량을 입력하세요.
          입력한 수량만큼 현재재고 표시에서 자동으로 차감됩니다 (담당자가 기록한 현재재고 값 자체는 바뀌지 않습니다).
        </p>

        <label className="field-label">망실 수량</label>
        <input
          type="number"
          min="1"
          className="field-input loss-modal__input"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          autoFocus
        />

        <div className="loss-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            망실 처리
          </button>
        </div>
      </div>
    </div>
  )
}
