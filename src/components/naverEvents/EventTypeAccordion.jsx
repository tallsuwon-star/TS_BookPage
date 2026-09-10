import { useState } from 'react'
import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import { getDeliveryStatusStyle, getEventOrderDisplayStatus, normalizeChannel } from '../../utils/aggregation'
import { getReviewRequestMessage } from '../../utils/reviewMessages'
import Badge from '../common/Badge'
import '../common/DataTable.css'
import './EventTypeAccordion.css'

// 클릭하면 아래로 주문 목록이 펼쳐지는 아코디언 한 칸. 유형(3+1/10원/기타 등)
// 별로 하나씩 렌더링한다. 체크박스로 여러 건을 골라 "일괄 발송처리"할 수
// 있는데, 같은 유형 안의 주문은 리뷰 요청 문구가 전부 동일해서 확인창을
// 한 번만 띄우고 그대로 적용하면 된다.
export default function EventTypeAccordion({ type, orders, shippingInfo, count, defaultOpen = false, onOpenDetail, onBulkProcess }) {
  const [open, setOpen] = useState(defaultOpen)
  const [selected, setSelected] = useState(() => new Set())

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => (prev.size === orders.length ? new Set() : new Set(orders.map((o) => o.id))))
  }

  const handleBulkProcess = () => {
    if (selected.size === 0) return
    const message = getReviewRequestMessage(type)
    const confirmed = window.confirm(
      `선택한 ${selected.size}건에 "${type}" 리뷰 요청 문자 안내를 발송처리 하시겠습니까?\n(문자 자동 발송은 아직 연동되지 않아, 확인을 누르면 발송처리 상태로 기록되고 문구는 담당자가 직접 복사해 전달해야 합니다.)`,
    )
    if (!confirmed) return
    onBulkProcess(Array.from(selected), message)
    setSelected(new Set())
  }

  return (
    <div className="event-accordion">
      <button type="button" className="event-accordion__header" onClick={() => setOpen((v) => !v)}>
        {type}
        <span className="event-accordion__count">{formatNumber(count)}건</span>
        <span className="event-accordion__chevron">{open ? '▾ 접기' : '▸ 펼치기'}</span>
      </button>

      {open && (
        <div className="event-accordion__body">
          <div className="event-accordion__toolbar">
            <button
              type="button"
              className="btn btn--ghost btn--table-action"
              onClick={handleBulkProcess}
              disabled={selected.size === 0}
            >
              선택 {selected.size}건 일괄 발송처리
            </button>
          </div>
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.size === orders.length && orders.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>주문일</th>
                  <th>상품명</th>
                  <th className="data-table--num">수량</th>
                  <th>구매처</th>
                  <th>상태</th>
                  <th>구매자</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const shipping = shippingInfo[order.id]
                  const displayStatus = getEventOrderDisplayStatus(order, shipping)
                  const style = getDeliveryStatusStyle(displayStatus)
                  return (
                    <tr key={order.id}>
                      <td>
                        <input type="checkbox" checked={selected.has(order.id)} onChange={() => toggleOne(order.id)} />
                      </td>
                      <td>{formatDateDisplay(order.orderDate)}</td>
                      <td className="data-table__name">{order.productName}</td>
                      <td className="data-table--num">{formatNumber(order.quantity)}</td>
                      <td>{order.channel ? normalizeChannel(order.channel) : '-'}</td>
                      <td>
                        <Badge label={displayStatus} color={style.color} background={style.bg} />
                      </td>
                      <td>{order.buyerName || '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--ghost btn--table-action"
                          onClick={() => onOpenDetail(order)}
                        >
                          상세보기
                        </button>
                      </td>
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
