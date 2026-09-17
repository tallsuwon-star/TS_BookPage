import { useState } from 'react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import { getDeliveryStatusStyle, getEventOrderDisplayStatus, normalizeChannel } from '../../utils/aggregation'
import { classifyEventType } from '../../utils/columnAliases'
import { getReviewRequestMessage } from '../../utils/reviewMessages'
import '../common/DataTable.css'

// 위쪽 "구분" 필터로 유형(3+1/10원/아이딕 탭 이벤트 등)을 골라서 보는 게
// 기본 사용법이라, 목록 자체는 유형별로 접었다 펼치지 않고 항상 펼쳐진
// 표 하나로 보여준다("전체"를 고르면 여러 유형이 섞여서 나오므로 "구분"
// 배지로 구분한다). 체크박스로 여러 건을 골라 "일괄 발송처리"할 수 있는데,
// 선택한 건들의 유형이 섞여 있으면 유형별로 나눠 각각 확인창을 띄운다
// (유형마다 리뷰 요청 문구가 다르기 때문).
export default function EventOrderListTable({ orders, shippingInfo, onOpenDetail, onBulkProcess }) {
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

    const groups = new Map()
    for (const order of orders) {
      if (!selected.has(order.id)) continue
      const type = classifyEventType(order.eventType)
      if (!groups.has(type)) groups.set(type, [])
      groups.get(type).push(order)
    }

    for (const [type, groupOrders] of groups) {
      const message = getReviewRequestMessage(type)
      const confirmed = window.confirm(
        `선택한 "${type}" 유형 ${groupOrders.length}건에 리뷰 요청 문자 안내를 발송처리 하시겠습니까?\n(문자 자동 발송은 아직 연동되지 않아, 확인을 누르면 발송처리 상태로 기록되고 문구는 담당자가 직접 복사해 전달해야 합니다.)`,
      )
      if (!confirmed) continue
      onBulkProcess(groupOrders.map((o) => o.id), message)
    }
    setSelected(new Set())
  }

  return (
    <Card title="이벤트 주문 목록" className="data-table-card">
      <div
        className="data-table-card__actions"
        style={{ justifyContent: 'flex-end', padding: '8px 16px', borderBottom: '1px solid var(--color-border)' }}
      >
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
                <input type="checkbox" checked={selected.size === orders.length && orders.length > 0} onChange={toggleAll} />
              </th>
              <th>주문일</th>
              <th>구분</th>
              <th>상품명</th>
              <th className="data-table--num">수량</th>
              <th>구매처</th>
              <th>상태</th>
              <th>구매자</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="data-table__empty">
                  표시할 이벤트 주문이 없습니다.
                </td>
              </tr>
            )}
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
                  <td>
                    <Badge label={classifyEventType(order.eventType)} color="#3457d5" background="#eaf0ff" />
                  </td>
                  <td className="data-table__name">{order.productName}</td>
                  <td className="data-table--num">{formatNumber(order.quantity)}</td>
                  <td>{order.channel ? normalizeChannel(order.channel) : '-'}</td>
                  <td>
                    <Badge label={displayStatus} color={style.color} background={style.bg} />
                  </td>
                  <td>{order.buyerName || '-'}</td>
                  <td>
                    <button type="button" className="btn btn--ghost btn--table-action" onClick={() => onOpenDetail(order)}>
                      상세보기
                    </button>
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
