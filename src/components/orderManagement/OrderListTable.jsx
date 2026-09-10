import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import { getDeliveryStatusStyle, isShippedStatus, isCancelledStatus, normalizeChannel } from '../../utils/aggregation'
import '../common/DataTable.css'

// 주문자명/연락처/이메일 등은 이 목록 표에는 표시하지 않는다(각 행의
// "송장처리"/"주문상세" 패널에서만 확인). 대신 몇 번째 주문인지 구분할 수
// 있도록 순번(NO)만 매긴다.
export default function OrderListTable({ orders, shippingInfo, onOpenInvoice, onOpenDetail }) {
  const total = orders.length

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
            {orders.map((order, idx) => {
              const shipping = shippingInfo[order.id]
              const displayStatus = shipping?.status || order.deliveryStatus
              const shipped = isShippedStatus(displayStatus)
              const cancelled = isCancelledStatus(displayStatus)
              const statusStyle = getDeliveryStatusStyle(displayStatus)
              return (
                <tr key={order.id || idx}>
                  <td>{total - idx}</td>
                  <td className="data-table__name">{order.productName}</td>
                  <td>{order.channel ? normalizeChannel(order.channel) : '-'}</td>
                  <td className="data-table--num">{formatNumber(order.quantity)}</td>
                  <td className="data-table--num">
                    {formatNumber((Number(order.quantity) || 0) * (Number(order.price) || 0))}원
                  </td>
                  <td>{formatDateDisplay(order.orderDate)}</td>
                  <td>
                    {displayStatus ? (
                      <Badge label={displayStatus} color={statusStyle.color} background={statusStyle.bg} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{shipping?.processedBy || (cancelled ? '-' : '관리자')}</td>
                  <td>
                    <div className="data-table__action-stack">
                      {cancelled ? (
                        <button type="button" className="btn btn--ghost btn--table-action" disabled>
                          처리완료
                        </button>
                      ) : shipped ? (
                        <button type="button" className="btn btn--ghost btn--table-action">
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
                      <button
                        type="button"
                        className="btn btn--ghost btn--table-action"
                        onClick={() => onOpenDetail(order)}
                      >
                        주문상세
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
