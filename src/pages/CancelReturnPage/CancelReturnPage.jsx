import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import CancelReturnFilterBar from '../../components/cancelReturn/CancelReturnFilterBar'
import CancelReturnSummaryCards from '../../components/cancelReturn/CancelReturnSummaryCards'
import CancelReturnRankingTable from '../../components/cancelReturn/CancelReturnRankingTable'
import CancelReturnListTable from '../../components/cancelReturn/CancelReturnListTable'
import { defaultDateRange } from '../../utils/dateUtils'
import {
  aggregateCancelReturnsByBook,
  CHANNEL_BUCKETS,
  computeCancelReturnSummary,
  extractCancelledFromOrders,
  filterCancelReturns,
  getAllClaimTypes,
  sortCancelReturnBooks,
} from '../../utils/aggregation'
import { exportCancelReturnsToExcel } from '../../utils/exportExcel'
import '../DashboardPage/DashboardPage.css'

export default function CancelReturnPage() {
  const { orders, cancelReturns, resetCancelReturns, loading } = useData()

  const [{ startDate, endDate }, setDateRange] = useState(defaultDateRange())
  const [sortKey, setSortKey] = useState('count')
  const [claimType, setClaimType] = useState('all')
  const [channel, setChannel] = useState('all')
  const [search, setSearch] = useState('')

  // "주문취소/반품관리" 전용 파일로 올린 내역 + 발주발송관리(주문) 파일의
  // 배송상태에 "취소"가 찍혀 자동으로 감지된 내역을 합쳐서 보여준다.
  // 후자는 orders에서 매번 다시 계산하는 값이라 따로 저장/동기화할 필요가 없다.
  const allRecords = useMemo(
    () => [...cancelReturns, ...extractCancelledFromOrders(orders)],
    [cancelReturns, orders],
  )

  const claimTypeOptions = useMemo(() => getAllClaimTypes(allRecords), [allRecords])
  const channelOptions = CHANNEL_BUCKETS

  const filteredRecords = useMemo(
    () => filterCancelReturns(allRecords, { startDate, endDate, claimType, channel }),
    [allRecords, startDate, endDate, claimType, channel],
  )

  const summary = useMemo(() => computeCancelReturnSummary(filteredRecords), [filteredRecords])
  const books = useMemo(
    () => sortCancelReturnBooks(aggregateCancelReturnsByBook(filteredRecords), sortKey),
    [filteredRecords, sortKey],
  )

  const searchedRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return filteredRecords
    return filteredRecords.filter((r) => r.productName.toLowerCase().includes(keyword))
  }, [filteredRecords, search])

  const handleExport = () => {
    exportCancelReturnsToExcel({ books, records: filteredRecords })
  }

  const handleReset = () => {
    if (window.confirm('저장된 모든 취소/반품 데이터를 초기화합니다. 계속할까요?')) {
      resetCancelReturns()
    }
  }

  if (loading) {
    return <div className="dashboard-page__loading">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">주문취소/반품관리</h1>
      <CancelReturnFilterBar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => setDateRange((prev) => ({ ...prev, startDate: v }))}
        onEndDateChange={(v) => setDateRange((prev) => ({ ...prev, endDate: v }))}
        sortKey={sortKey}
        onSortChange={setSortKey}
        claimType={claimType}
        onClaimTypeChange={setClaimType}
        claimTypeOptions={claimTypeOptions}
        channel={channel}
        onChannelChange={setChannel}
        channelOptions={channelOptions}
        onExport={handleExport}
        onReset={handleReset}
      />

      <div className="dashboard-page__cards">
        <CancelReturnSummaryCards summary={summary} />
      </div>

      <div className="dashboard-page__tables">
        <CancelReturnRankingTable books={books} />
        <CancelReturnListTable records={searchedRecords} search={search} onSearchChange={setSearch} />
      </div>
    </div>
  )
}
