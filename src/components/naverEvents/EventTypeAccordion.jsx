import { useState } from 'react'
import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import { getDeliveryStatusStyle, normalizeChannel } from '../../utils/aggregation'
import Badge from '../common/Badge'
import '../common/DataTable.css'
import './EventTypeAccordion.css'

// 클릭하면 아래로 주문 목록이 펼쳐지는 아코디언 한 칸. 유형(3+1/10원/기타 등)
// 별로 하나씩 렌더링한다.
export default function EventTypeAccordion({ type, orders, count, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="event-accordion">
      <button type="button" className="event-accordion__header" onClick={() => setOpen((v) => !v)}>
        {type}
        <span className="event-accordion__count">{formatNumber(count)}건</span>
        <span className="event-accordion__chevron">{open ? '▾ 접기' : '▸ 펼치기'}</span>
      </button>

      {open && (
        <div className="event-accordion__body">
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>주문일</th>
                  <th>상품명</th>
                  <th className="data-table--num">수량</th>
                  <th>구매처</th>
                  <th>주문상태</th>
                  <th>구매자</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const style = getDeliveryStatusStyle(order.deliveryStatus)
                  return (
                    <tr key={order.id}>
                      <td>{formatDateDisplay(order.orderDate)}</td>
                      <td className="data-table__name">{order.productName}</td>
                      <td className="data-table--num">{formatNumber(order.quantity)}</td>
                      <td>{order.channel ? normalizeChannel(order.channel) : '-'}</td>
                      <td>
                        {order.deliveryStatus ? (
                          <Badge label={order.deliveryStatus} color={style.color} background={style.bg} />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{order.buyerName || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
