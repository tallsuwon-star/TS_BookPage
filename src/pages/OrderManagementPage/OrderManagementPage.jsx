import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import OrderFilterBar from '../../components/orderManagement/OrderFilterBar'
import OrderListTable from '../../components/orderManagement/OrderListTable'
import InvoiceProcessPanel from '../../components/orderManagement/InvoiceProcessPanel'
import OrderDetailView from '../../components/orderManagement/OrderDetailView'
import { defaultDateRange } from '../../utils/dateUtils'
import { CHANNEL_BUCKETS, filterOrders, getAllDeliveryStatuses } from '../../utils/aggregation'
import '../DashboardPage/DashboardPage.css'
import './OrderManagementPage.css'

// "교재상품 결제확인"이 기간별 집계 대시보드라면, 이 화면은 주문 한 건 한 건을
// 그대로 나열하는 원장(raw list) 화면이다. 같은 DataContext의 orders를 그대로
// 읽기 때문에, 어느 화면에서 "파일로 정보입력"을 하든 두 화면 모두에 자동으로
// 반영된다.
export default function OrderManagementPage() {
  const { orders, shippingInfo, updateShippingInfo, loading } = useData()

  const [{ startDate, endDate }, setDateRange] = useState(defaultDateRange())
  const [channel, setChannel] = useState('all')
  const [deliveryStatus, setDeliveryStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState(null) // { type: 'invoice' | 'detail', order } | null

  const channelOptions = CHANNEL_BUCKETS
  const deliveryStatusOptions = useMemo(() => getAllDeliveryStatuses(orders), [orders])

  const filteredOrders = useMemo(
    () => filterOrders(orders, { startDate, endDate, channel, deliveryStatus }),
    [orders, startDate, endDate, channel, deliveryStatus],
  )

  const searchedOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return filteredOrders
    return filteredOrders.filter((o) => (o.productName || '').toLowerCase().includes(keyword))
  }, [filteredOrders, search])

  if (loading) {
    return <div className="dashboard-page__loading">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">교재 주문/재고관리</h1>
      <OrderFilterBar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => setDateRange((prev) => ({ ...prev, startDate: v }))}
        onEndDateChange={(v) => setDateRange((prev) => ({ ...prev, endDate: v }))}
        channel={channel}
        onChannelChange={setChannel}
        channelOptions={channelOptions}
        deliveryStatus={deliveryStatus}
        onDeliveryStatusChange={setDeliveryStatus}
        deliveryStatusOptions={deliveryStatusOptions}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="order-management__body">
        <div className="order-management__table">
          <OrderListTable
            orders={searchedOrders}
            shippingInfo={shippingInfo}
            onOpenInvoice={(order) => setPanel({ type: 'invoice', order })}
            onOpenDetail={(order) => setPanel({ type: 'detail', order })}
          />
        </div>

        {panel?.type === 'invoice' && (
          <InvoiceProcessPanel
            order={panel.order}
            onClose={() => setPanel(null)}
            onSave={(patch) => updateShippingInfo(panel.order.id, patch)}
          />
        )}
        {panel?.type === 'detail' && (
          <OrderDetailView
            order={panel.order}
            shipping={shippingInfo[panel.order.id]}
            onClose={() => setPanel(null)}
            onUpdateStatus={(status) => updateShippingInfo(panel.order.id, { status })}
          />
        )}
      </div>
    </div>
  )
}
