import { useState } from 'react'
import './InitialStockModal.css'

export default function InitialStockModal({ rows, onSave, onCancel }) {
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(rows.map((row) => [row.productName, String(row.currentStock ?? 0)])),
  )

  const handleSave = () => {
    const stockByProductName = Object.fromEntries(
      Object.entries(drafts).map(([name, v]) => [name, Number(v) || 0]),
    )
    onSave(stockByProductName)
  }

  return (
    <div className="stock-modal__backdrop" role="dialog" aria-modal="true">
      <div className="stock-modal">
        <h3>현재재고 입력</h3>
        <p className="stock-modal__desc">교재별 현재 재고 수량을 한 번에 입력하고 저장할 수 있습니다.</p>

        <div className="stock-modal__list">
          {rows.length === 0 && <p className="stock-modal__empty">등록된 교재가 없습니다.</p>}
          {rows.map((row) => (
            <div className="stock-modal__row" key={row.productName}>
              <span className="stock-modal__name">{row.productName}</span>
              <input
                type="number"
                min="0"
                className="stock-modal__input"
                value={drafts[row.productName]}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [row.productName]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <p className="stock-modal__notice">⚠ 교재관리 담당자만 기록/수정할 수 있습니다.</p>

        <div className="stock-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
