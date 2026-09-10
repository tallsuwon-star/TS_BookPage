import Card from '../common/Card'
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format'
import '../common/DataTable.css'

export default function BookRankingTable({ books }) {
  const totals = books.reduce(
    (acc, b) => ({
      orderCount: acc.orderCount + b.orderCount,
      orderQty: acc.orderQty + b.orderQty,
      orderAmount: acc.orderAmount + b.orderAmount,
    }),
    { orderCount: 0, orderQty: 0, orderAmount: 0 },
  )

  return (
    <Card title="교재별 주문 많은 순" className="data-table-card">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>순위</th>
              <th>교재명</th>
              <th className="data-table--num">주문 건수</th>
              <th className="data-table--num">주문 수량</th>
              <th className="data-table--num">주문 금액</th>
              <th className="data-table--num">비중</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="data-table__empty">
                  선택한 조건에 해당하는 주문 데이터가 없습니다.
                </td>
              </tr>
            )}
            {books.map((book, index) => (
              <tr key={book.productName}>
                <td>{index + 1}</td>
                <td className="data-table__name">{book.productName}</td>
                <td className="data-table--num">{formatNumber(book.orderCount)}</td>
                <td className="data-table--num">{formatNumber(book.orderQty)}</td>
                <td className="data-table--num">{formatCurrency(book.orderAmount)}</td>
                <td className="data-table--num">{formatPercent(book.ratio)}</td>
              </tr>
            ))}
          </tbody>
          {books.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={2}>합계</td>
                <td className="data-table--num">{formatNumber(totals.orderCount)}</td>
                <td className="data-table--num">{formatNumber(totals.orderQty)}</td>
                <td className="data-table--num">{formatCurrency(totals.orderAmount)}</td>
                <td className="data-table--num">100.0%</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  )
}
