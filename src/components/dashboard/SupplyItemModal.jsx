import { useState } from 'react'
import './SupplyItemModal.css'

// 타포(oper.tsai.kr) "재고관리" 화면의 추가/수정 팝업(480x520 새 창)을
// 대체하는 인앱 모달. item이 없으면 추가, 있으면 수정 모드다.
export default function SupplyItemModal({ item, onSave, onCancel }) {
  const [name, setName] = useState(item?.name || '')
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 0))
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) {
      setError('재고명을 입력해주세요.')
      return
    }
    onSave({ name: name.trim(), quantity: Number(quantity) || 0 })
  }

  return (
    <div className="supply-modal__backdrop" role="dialog" aria-modal="true">
      <div className="supply-modal">
        <h3>{item ? '재고 수정' : '재고 추가'}</h3>

        <label className="field-label">재고명</label>
        <input
          type="text"
          className="field-input supply-modal__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 박스"
          autoFocus
        />

        <label className="field-label">재고갯수</label>
        <input
          type="number"
          min="0"
          className="field-input supply-modal__input"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {error && <p className="supply-modal__error">{error}</p>}

        <div className="supply-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            {item ? '수정' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}
