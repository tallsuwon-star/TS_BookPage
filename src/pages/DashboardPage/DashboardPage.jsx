import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import FilterBar from '../../components/dashboard/FilterBar'
import SummaryCards from '../../components/dashboard/SummaryCards'
import ChannelBarCard from '../../components/dashboard/ChannelBarCard'
import BookRankingTable from '../../components/dashboard/BookRankingTable'
import InventoryTable from '../../components/dashboard/InventoryTable'
import LowStockAlertPanel from '../../components/dashboard/LowStockAlertPanel'
import { defaultDateRange } from '../../utils/dateUtils'
import {
  aggregateByBook,
  CHANNEL_BUCKETS,
  computeChannelBreakdown,
  computeShippedQtyByBook,
  computeSummary,
  filterOrders,
  getAllProductNames,
  sortBooks,
} from '../../utils/aggregation'
import { BOOK_CATEGORIES, classifyBookCategory } from '../../utils/columnAliases'
import { getStockStatusKey } from '../../utils/inventoryStatus'
import { exportDashboardToExcel } from '../../utils/exportExcel'
import './DashboardPage.css'

export default function DashboardPage() {
  const { orders, inventory, updateInventoryField, updateCurrentStockBulk, addInventoryLoss, resetData, loading } =
    useData()

  const [{ startDate, endDate }, setDateRange] = useState(defaultDateRange())
  const [sortKey, setSortKey] = useState('orderCount')
  const [channel, setChannel] = useState('all')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  const channelOptions = CHANNEL_BUCKETS
  const categoryOptions = BOOK_CATEGORIES

  const filteredOrders = useMemo(
    () => filterOrders(orders, { startDate, endDate, channel, category }),
    [orders, startDate, endDate, channel, category],
  )

  const summary = useMemo(() => computeSummary(filteredOrders), [filteredOrders])
  const books = useMemo(() => sortBooks(aggregateByBook(filteredOrders), sortKey), [filteredOrders, sortKey])
  const channelBreakdown = useMemo(() => computeChannelBreakdown(filteredOrders), [filteredOrders])
  const shippedQtyByBook = useMemo(() => computeShippedQtyByBook(filteredOrders), [filteredOrders])

  const inventoryRows = useMemo(() => {
    const names = getAllProductNames(orders, inventory)
    return names
      .map((productName) => {
        const item = inventory[productName] || {}
        const currentStock = Number(item.currentStock) || 0
        const lossQty = Number(item.lossQty) || 0
        return {
          productName,
          category: classifyBookCategory(productName),
          currentStock,
          lossQty,
          effectiveStock: Math.max(0, currentStock - lossQty),
          safetyStock: Number(item.safetyStock) || 0,
          shippedQty: shippedQtyByBook.get(productName) || 0,
        }
      })
      .filter((row) => (category === 'all' ? true : row.category === category))
      .filter((row) => row.productName.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => a.productName.localeCompare(b, 'ko'))
  }, [orders, inventory, shippedQtyByBook, category, search])

  const shortageRows = useMemo(
    () => inventoryRows.filter((row) => getStockStatusKey(row.effectiveStock, row.safetyStock) === 'shortage'),
    [inventoryRows],
  )

  const handleExport = () => {
    exportDashboardToExcel({ books, orders: filteredOrders })
  }

  const handleReset = () => {
    if (window.confirm('저장된 모든 주문/재고 데이터를 초기화합니다. 계속할까요?')) {
      resetData()
    }
  }

  if (loading) {
    return <div className="dashboard-page__loading">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">교재 주문 대시보드</h1>
      <FilterBar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => setDateRange((prev) => ({ ...prev, startDate: v }))}
        onEndDateChange={(v) => setDateRange((prev) => ({ ...prev, endDate: v }))}
        sortKey={sortKey}
        onSortChange={setSortKey}
        channel={channel}
        onChannelChange={setChannel}
        channelOptions={channelOptions}
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={categoryOptions}
        onExport={handleExport}
        onReset={handleReset}
      />

      <div className="dashboard-page__cards">
        <SummaryCards summary={summary} />
        {channelBreakdown.length > 0 && <ChannelBarCard data={channelBreakdown} />}
      </div>

      <div className="dashboard-page__tables">
        <BookRankingTable books={books} />
        <InventoryTable
          rows={inventoryRows}
          search={search}
          onSearchChange={setSearch}
          onUpdateField={updateInventoryField}
          onUpdateStockBulk={updateCurrentStockBulk}
          onAddLoss={addInventoryLoss}
        />
      </div>

      <LowStockAlertPanel rows={shortageRows} />
    </div>
  )
}
