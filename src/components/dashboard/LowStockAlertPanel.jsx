import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatNumber } from '../../utils/format'
import { STOCK_STATUS } from '../../utils/inventoryStatus'
import '../common/DataTable.css'

export default function LowStockAlertPanel({ rows }) {
  return (
    <Card
      title="재고 부족 경고"
      action={<Badge label={`${rows.length}건`} color={STOCK_STATUS.shortage.color} background={STOCK_STATUS.shortage.bg} />}
      className="data-table-card"
    >
      {rows.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--color-text-faint)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
          재고부족 상태인 교재가 없습니다.
        </p>
      ) : (
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>교재명</th>
                <th className="data-table--num">현재재고</th>
                <th className="data-table--num">안전재고</th>
                <th className="data-table--num">기간 출고</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.productName}>
                  <td className="data-table__name">{row.productName}</td>
                  <td className="data-table--num">{formatNumber(row.effectiveStock)}</td>
                  <td className="data-table--num">{formatNumber(row.safetyStock)}</td>
                  <td className="data-table--num">{formatNumber(row.shippedQty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
