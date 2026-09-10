import { useState } from 'react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import SearchInput from '../common/SearchInput'
import InitialStockModal from './InitialStockModal'
import LossEntryModal from './LossEntryModal'
import { formatNumber } from '../../utils/format'
import { getStockStatus } from '../../utils/inventoryStatus'
import '../common/DataTable.css'

function EditableNumberCell({ value, onCommit }) {
  const [draft, setDraft] = useState(String(value ?? 0))

  return (
    <input
      type="number"
      min="0"
      className="data-table__edit-input"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const num = Number(draft)
        if (!Number.isNaN(num) && num !== value) onCommit(num)
        else setDraft(String(value ?? 0))
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
    />
  )
}

export default function InventoryTable({ rows, search, onSearchChange, onUpdateField, onUpdateStockBulk, onAddLoss }) {
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [lossModalProduct, setLossModalProduct] = useState(null)

  return (
    <Card
      title="전체 교재 수량 현황"
      action={
        <div className="data-table-card__actions">
          <button type="button" className="btn btn--ghost" onClick={() => setStockModalOpen(true)}>
            현재재고 입력
          </button>
          <SearchInput value={search} onChange={onSearchChange} placeholder="교재명 검색" />
        </div>
      }
      className="data-table-card"
    >
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>교재명</th>
              <th className="data-table--num">현재재고</th>
              <th className="data-table--num">안전재고</th>
              <th className="data-table--num">기간 출고</th>
              <th>재고상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="data-table__empty">
                  표시할 교재가 없습니다.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const status = getStockStatus(row.effectiveStock, row.safetyStock)
              return (
                <tr key={row.productName}>
                  <td className="data-table__name">{row.productName}</td>
                  <td className="data-table--num">
                    {formatNumber(row.effectiveStock)}
                    {row.lossQty > 0 && (
                      <div className="data-table__substat">-{formatNumber(row.lossQty)} 망실</div>
                    )}
                  </td>
                  <td className="data-table--num">
                    <EditableNumberCell
                      value={row.safetyStock}
                      onCommit={(v) => onUpdateField(row.productName, 'safetyStock', v)}
                    />
                  </td>
                  <td className="data-table--num">{formatNumber(row.shippedQty)}</td>
                  <td>
                    <Badge label={status.label} color={status.color} background={status.bg} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--table-action"
                      onClick={() => setLossModalProduct(row.productName)}
                    >
                      망실처리
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {stockModalOpen && (
        <InitialStockModal
          rows={rows}
          onCancel={() => setStockModalOpen(false)}
          onSave={(stockByProductName) => {
            onUpdateStockBulk(stockByProductName)
            setStockModalOpen(false)
          }}
        />
      )}

      {lossModalProduct && (
        <LossEntryModal
          productName={lossModalProduct}
          onCancel={() => setLossModalProduct(null)}
          onSave={(qty) => {
            onAddLoss(lossModalProduct, qty)
            setLossModalProduct(null)
          }}
        />
      )}
    </Card>
  )
}
