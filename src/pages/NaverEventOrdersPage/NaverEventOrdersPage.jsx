import { useMemo } from 'react'
import { useData } from '../../context/DataContext'
import Card from '../../components/common/Card'
import EventTypeAccordion from '../../components/naverEvents/EventTypeAccordion'
import { groupEventOrdersByType } from '../../utils/aggregation'
import '../../components/common/DataTable.css'
import '../DashboardPage/DashboardPage.css'

// 발주발송관리 파일에 함께 섞여 내려오는, 교재가 아닌 이벤트성 주문(화상영어
// 체험권, 3+1 이벤트, 10원 이벤트 등)을 확인하는 화면. "교재 주문/재고관리"
// 등에서 쓰는 것과 같은 주문 파일을 올리면 자동으로 채워지며, 별도 업로드가
// 필요 없다(팀이 시트에 미리 계산해 둔 "구분" 열 값 기준으로 묶는다).
export default function NaverEventOrdersPage() {
  const { eventOrders, loading } = useData()

  const groups = useMemo(() => groupEventOrdersByType(eventOrders), [eventOrders])

  if (loading) {
    return <div className="dashboard-page__loading">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">네이버 이벤트 주문건</h1>
      <p className="dashboard-page__desc">
        화상영어 체험권, 3+1 이벤트, 10원 이벤트 등 교재가 아닌 주문을 유형별로 모아 보여줍니다. "교재 주문
        대시보드"/"교재주문·재고관리"에서 올리는 주문 파일과 같은 파일을 그대로 사용하므로 따로 업로드할 필요는
        없습니다. 유형을 누르면 해당 주문 목록이 아래로 펼쳐집니다.
      </p>

      <Card title="유형별 주문 현황" className="data-table-card">
        {groups.length === 0 ? (
          <p className="data-table__empty">표시할 이벤트 주문이 없습니다. 주문 파일을 올리면 자동으로 채워집니다.</p>
        ) : (
          groups.map((group, idx) => (
            <EventTypeAccordion
              key={group.type}
              type={group.type}
              orders={group.orders}
              count={group.count}
              defaultOpen={idx === 0}
            />
          ))
        )}
      </Card>
    </div>
  )
}
