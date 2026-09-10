import Card from '../common/Card'
import Badge from '../common/Badge'
import SearchInput from '../common/SearchInput'
import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import { isCancelProcessed, normalizeChannel } from '../../utils/aggregation'
import '../common/DataTable.css'

const TYPE_COLORS = {
  취소: { color: '#b45309', bg: '#fffbeb' },
  반품: { color: '#dc2626', bg: '#fef2f2' },
  교환: { color: '#3457d5', bg: '#eaf0ff' },
}
const DEFAULT_COLOR = { color: '#475569', bg: '#f1f5f9' }

export default function CancelReturnListTable({ records, search, onSearchChange }) {
  // 처리상태가 "완료"류가 아닌(=아직 처리 안 된) 건을 위쪽에 남기고,
  // 처리된 건은 아래로 내린다. 담당자가 매일 처리상태를 확인하므로
  // 처리상태 값 자체가 없어도(빈 값 = 미처리로 간주) 문제없다.
  const sortedRecords = [...records].sort(
    (a, b) => Number(isCancelProcessed(a.status)) - Number(isCancelProcessed(b.status)),
  )

  return (
    <Card
      title="전체 취소/반품 내역"
      action={<SearchInput value={search} onChange={onSearchChange} placeholder="교재명 검색" />}
      className="data-table-card"
    >
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>신청일</th>
              <th>교재명</th>
              <th className="data-table--num">수량</th>
              <th>구분</th>
              <th>사유</th>
              <th>처리상태</th>
              <th>판매채널</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="data-table__empty">
                  표시할 취소/반품 내역이 없습니다.
                </td>
              </tr>
            )}
            {sortedRecords.map((r) => {
              const style = TYPE_COLORS[r.claimType] || DEFAULT_COLOR
              return (
                <tr key={r.id}>
                  <td>{formatDateDisplay(r.claimDate)}</td>
                  <td className="data-table__name">{r.productName}</td>
                  <td className="data-table--num">{formatNumber(r.quantity)}</td>
                  <td>
                    <Badge label={r.claimType || '미지정'} color={style.color} background={style.bg} />
                    {r.source === 'order-file' && <span className="data-table__tag">자동감지</span>}
                  </td>
                  <td className="data-table__name">{r.reason || '-'}</td>
                  <td>{r.status || '-'}</td>
                  <td>{r.channel ? normalizeChannel(r.channel) : '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
