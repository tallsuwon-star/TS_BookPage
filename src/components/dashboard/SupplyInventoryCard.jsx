import Card from '../common/Card'
import { formatNumber } from '../../utils/format'
import '../common/DataTable.css'

// 타포(oper.tsai.kr/admin/inventory) "재고관리" 화면과 1:1로 맞춘 비품/물품
// 재고 목록. 교재별 재고(InventoryTable)와 달리 주문 데이터와 무관한
// 독립 항목(박스 등)이라 같은 대시보드 페이지 안에 별도 카드로 둔다.
export default function SupplyInventoryCard({ items, onAdd, onEdit }) {
  return (
    <Card
      title="재고관리"
      action={
        <button type="button" className="btn btn--primary btn--table-action" onClick={onAdd}>
          + 추가
        </button>
      }
      className="data-table-card"
    >
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>No</th>
              <th>재고명</th>
              <th className="data-table--num">재고갯수</th>
              <th style={{ width: 72 }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  등록된 재고가 없습니다.
                </td>
              </tr>
            )}
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td className="data-table__name">{item.name}</td>
                <td className="data-table--num">{formatNumber(item.quantity)}</td>
                <td>
                  <button type="button" className="btn btn--ghost btn--table-action" onClick={() => onEdit(item)}>
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
