import ExcelUploadButton from '../common/ExcelUploadButton'
import SearchInput from '../common/SearchInput'
import { parseOrderExcelFile } from '../../utils/excelParser'
import { useData } from '../../context/DataContext'
import '../dashboard/FilterBar.css'

export default function OrderFilterBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  channel,
  onChannelChange,
  channelOptions,
  deliveryStatus,
  onDeliveryStatusChange,
  deliveryStatusOptions,
  search,
  onSearchChange,
}) {
  const { uploadOrders } = useData()

  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
        <div>
          <label className="field-label">시작일</label>
          <input
            type="date"
            className="field-input"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
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
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">구매처</label>
          <select className="field-select" value={channel} onChange={(e) => onChannelChange(e.target.value)}>
            <option value="all">전체</option>
            {channelOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">배송상태</label>
          <select
            className="field-select"
            value={deliveryStatus}
            onChange={(e) => onDeliveryStatusChange(e.target.value)}
          >
            <option value="all">전체</option>
            {deliveryStatusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <SearchInput value={search} onChange={onSearchChange} placeholder="교재명 검색" />
      </div>

      <div className="filter-bar__group">
        <ExcelUploadButton
          label="📄 파일로 정보입력"
          recordLabel="주문"
          recordsKey="orders"
          parseFn={parseOrderExcelFile}
          onImport={(orders, raw) => uploadOrders(orders, raw?.eventOrders)}
        />
      </div>
    </div>
  )
}
