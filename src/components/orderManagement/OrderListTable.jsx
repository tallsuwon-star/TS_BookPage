import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import {
  getDeliveryStatusStyle,
  isShippedStatus,
  isCancelledStatus,
  isReturnCollectingStatus,
  normalizeChannel,
} from '../../utils/aggregation'
import '../common/DataTable.css'

// 주문자명/연락처/이메일 등은 이 목록 표에는 표시하지 않는다(각 행의
// "송장처리"/"주문상세" 패널에서만 확인). 대신 몇 번째 주문인지 구분할 수
// 있도록 순번(NO)만 매긴다.
export default function OrderListTable({ orders, shippingInfo, onOpenInvoice, onOpenDetail, onOpenReturn }) {
  const total = orders.length

  // 발송대기 건은 위쪽에, 발송중/발송완료/취소/수거중 건은 아래쪽에 모아서
  // 처리해야 할 주문이 한눈에 보이게 한다. 같은 그룹 안에서는 원래 순서를
  // 그대로 유지한다.
  const rows = orders.map((order, idx) => {
    const shipping = shippingInfo[order.id]
    const displayStatus = shipping?.returnStatus || shipping?.status || order.deliveryStatus
    return {
      order,
      no: total - idx,
      shipping,
      displayStatus,
      shipped: isShippedStatus(displayStatus),
      cancelled: isCancelledStatus(displayStatus),
      returning: isReturnCollectingStatus(displayStatus),
      statusStyle: getDeliveryStatusStyle(displayStatus),
    }
  })
  const pendingRows = rows.filter((r) => !r.shipped && !r.cancelled && !r.returning)
  const doneRows = rows.filter((r) => r.shipped || r.cancelled || r.returning)

  const renderRow = ({ order, no, shipping, displayStatus, shipped, cancelled, returning, statusStyle }) => (
    <tr key={order.id}>
      <td>{no}</td>
      <td className="data-table__name">{order.productName}</td>
      <td>{order.channel ? normalizeChannel(order.channel) : '-'}</td>
      <td className="data-table--num">{formatNumber(order.quantity)}</td>
      <td className="data-table--num">
        {formatNumber((Number(order.quantity) || 0) * (Number(order.price) || 0))}원
      </td>
      <td>{formatDateDisplay(order.orderDate)}</td>
      <td>
        {displayStatus ? <Badge label={displayStatus} color={statusStyle.color} background={statusStyle.bg} /> : '-'}
      </td>
      <td>{shipping?.processedBy || (cancelled ? '-' : '관리자')}</td>
      <td>
        <div className="data-table__action-stack">
          {cancelled ? (
            <button type="button" className="btn btn--ghost btn--table-action" disabled>
              처리완료
            </button>
          ) : returning ? (
            <button type="button" className="btn btn--ghost btn--table-action" disabled>
              수거중
            </button>
          ) : shipped ? (
            <button type="button" className="btn btn--ghost btn--table-action" onClick={() => onOpenReturn(order)}>
              반품신청
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--table-action"
              onClick={() => onOpenInvoice(order)}
            >
              송장처리
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--table-action" onClick={() => onOpenDetail(order)}>
            주문상세
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <Card title="교재 주문 목록" className="data-table-card">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>NO</th>
              <th>교재명</th>
              <th>구매처</th>
              <th className="data-table--num">수량</th>
              <th className="data-table--num">결제금액</th>
              <th>결제일</th>
              <th>배송상태</th>
              <th>처리자</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="data-table__empty">
                  표시할 주문이 없습니다.
                </td>
              </tr>
            )}
            {pendingRows.map(renderRow)}
            {pendingRows.length > 0 && doneRows.length > 0 && (
              <tr className="data-table__divider-row">
                <td colSpan={9}>발송중 · 처리완료</td>
              </tr>
            )}
            {doneRows.map(renderRow)}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
