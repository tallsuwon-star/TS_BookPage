import Card from '../common/Card'
import { formatNumber, formatPercent } from '../../utils/format'
import '../common/DataTable.css'

export default function CancelReturnRankingTable({ books }) {
  const totals = books.reduce(
    (acc, b) => ({ count: acc.count + b.count, qty: acc.qty + b.qty }),
    { count: 0, qty: 0 },
  )

  return (
    <Card title="교재별 취소·반품 많은 순" className="data-table-card">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>순위</th>
              <th>교재명</th>
              <th className="data-table--num">건수</th>
              <th className="data-table--num">수량</th>
              <th className="data-table--num">비중</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && (
              <tr>
                <td colSpan={5} className="data-table__empty">
                  선택한 조건에 해당하는 취소/반품 데이터가 없습니다.
                </td>
              </tr>
            )}
            {books.map((book, index) => (
              <tr key={book.productName}>
                <td>{index + 1}</td>
                <td className="data-table__name">{book.productName}</td>
                <td className="data-table--num">{formatNumber(book.count)}</td>
                <td className="data-table--num">{formatNumber(book.qty)}</td>
                <td className="data-table--num">{formatPercent(book.ratio)}</td>
              </tr>
            ))}
          </tbody>
          {books.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={2}>합계</td>
                <td className="data-table--num">{formatNumber(totals.count)}</td>
                <td className="data-table--num">{formatNumber(totals.qty)}</td>
                <td className="data-table--num">100.0%</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  )
}
