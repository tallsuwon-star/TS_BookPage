import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import EventTypeBarCard from '../../components/naverEvents/EventTypeBarCard'
import EventOrderListTable from '../../components/naverEvents/EventOrderListTable'
import EventOrderDetailView from '../../components/naverEvents/EventOrderDetailView'
import ExcelUploadButton from '../../components/common/ExcelUploadButton'
import { parseReviewExcelFile } from '../../utils/excelParser'
import { computeEventTypeBreakdown, filterEventOrders, getAllEventTypes } from '../../utils/aggregation'
import { defaultDateRange } from '../../utils/dateUtils'
import '../../components/common/DataTable.css'
import '../DashboardPage/DashboardPage.css'
import '../OrderManagementPage/OrderManagementPage.css'
import '../../components/dashboard/FilterBar.css'

// 발주발송관리 파일에 함께 섞여 내려오는, 교재가 아닌 이벤트성 주문(화상영어
// 체험권, 3+1 이벤트, 10원 이벤트 등)을 확인하는 화면. "교재 주문/재고관리"
// 등에서 쓰는 것과 같은 주문 파일을 올리면 자동으로 채워지며, 별도 업로드가
// 필요 없다(팀이 시트에 미리 계산해 둔 "구분" 열 값 기준으로 묶는다).
//
// 유형이 여러 개일 때 하나씩 아코디언을 펼쳐봐야 하는 게 불편하다는 피드백에
// 따라, "교재 주문 대시보드"의 "교재구분" 필터와 같은 방식으로 상단에
// "구분" 드롭다운을 두고 고른 유형만 표로 바로 보여준다(아코디언 제거).
//
// "발송처리"를 하면 리뷰 요청 문자 문구가 준비되고(자동 발송 미연동이라
// 담당자가 직접 전달), 네이버 "리뷰 관리" 파일을 올리면 주문번호가 일치하는
// 건이 자동으로 "리뷰 작성완료"로 바뀐다. 상태가 바뀌어도 목록 순서는
// 그대로 유지한다(취소/반품관리처럼 처리된 건을 아래로 내리지 않는다) —
// 파일을 다시 올릴 때마다 상태가 그 자리에서 갱신되는 편이 확인하기 쉽다.
export default function NaverEventOrdersPage() {
  const { eventOrders, shippingInfo, updateShippingInfo, uploadReviews, loading } = useData()
  const [detailOrder, setDetailOrder] = useState(null)
  const [{ startDate, endDate }, setDateRange] = useState(defaultDateRange())
  const [eventType, setEventType] = useState('all')

  const eventTypeOptions = useMemo(() => getAllEventTypes(eventOrders), [eventOrders])

  const filteredEventOrders = useMemo(
    () => filterEventOrders(eventOrders, { startDate, endDate, eventType }),
    [eventOrders, startDate, endDate, eventType],
  )
  const breakdown = useMemo(() => computeEventTypeBreakdown(filteredEventOrders), [filteredEventOrders])

  const handleBulkProcess = async (ids, message) => {
    for (const id of ids) {
      await updateShippingInfo(id, {
        status: '발송중',
        processedBy: '관리자',
        processedAt: new Date().toISOString(),
        sentMessage: message,
      })
    }
  }

  if (loading) {
    return <div className="dashboard-page__loading">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">네이버 이벤트 주문건</h1>
      <p className="dashboard-page__desc">
        화상영어 체험권, 3+1 이벤트, 10원 이벤트 등 교재가 아닌 주문을 유형별로 모아 보여줍니다. "교재 주문
        대시보드"/"교재주문·재고관리"에서 올리는 주문 파일과 같은 파일을 그대로 사용하므로 따로 업로드할 필요는
        없습니다. "발송처리"를 하면 리뷰 요청 문자 문구가 준비되고(자동 발송 미연동이라 직접 전달), 네이버 "리뷰
        관리" 파일을 올리면 주문번호가 일치하는 건이 자동으로 "리뷰 작성완료"로 표시됩니다.
      </p>

      <div className="filter-bar">
        <div className="filter-bar__group">
          <div>
            <label className="field-label">시작일</label>
            <input
              type="date"
              className="field-input"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <span className="filter-bar__tilde">~</span>
          <div>
            <label className="field-label">종료일</label>
            <input
              type="date"
              className="field-input"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="field-label">구분</label>
            <select className="field-select" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option value="all">전체</option>
              {eventTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="dashboard-page__cards">
          <EventTypeBarCard data={breakdown} />
        </div>
      )}

      <div className="data-table-card__actions" style={{ marginBottom: 16 }}>
        <ExcelUploadButton
          label="📄 리뷰 파일 업로드"
          recordLabel="리뷰"
          recordsKey="reviews"
          parseFn={parseReviewExcelFile}
          onImport={uploadReviews}
        />
      </div>

      <div className="order-management__body">
        <div className="order-management__table">
          <EventOrderListTable
            orders={filteredEventOrders}
            shippingInfo={shippingInfo}
            onOpenDetail={setDetailOrder}
            onBulkProcess={handleBulkProcess}
          />
        </div>

        {detailOrder && (
          <EventOrderDetailView
            order={detailOrder}
            shipping={shippingInfo[detailOrder.id]}
            onSave={(patch) => {
              updateShippingInfo(detailOrder.id, patch)
              setDetailOrder(null)
            }}
            onClose={() => setDetailOrder(null)}
          />
        )}
      </div>
    </div>
  )
}
