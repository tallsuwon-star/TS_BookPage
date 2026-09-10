import ExcelUploadButton from '../common/ExcelUploadButton'
import { parseOrderExcelFile } from '../../utils/excelParser'
import { useData } from '../../context/DataContext'
import './FilterBar.css'

const SORT_OPTIONS = [
  { value: 'orderCount', label: '주문 건수순' },
  { value: 'orderQty', label: '주문 수량순' },
  { value: 'orderAmount', label: '주문 금액순' },
]

export default function FilterBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  sortKey,
  onSortChange,
  channel,
  onChannelChange,
  channelOptions,
  category,
  onCategoryChange,
  categoryOptions,
  onExport,
  onReset,
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
          <label className="field-label">정렬</label>
          <select className="field-select" value={sortKey} onChange={(e) => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">판매채널</label>
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
          <label className="field-label">교재구분</label>
          <select className="field-select" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="all">전체</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-bar__group">
        <ExcelUploadButton
          label="📄 파일로 정보입력"
          recordLabel="주문"
          recordsKey="orders"
          parseFn={parseOrderExcelFile}
          onImport={(orders, raw) => uploadOrders(orders, raw?.eventOrders)}
        />
        <button type="button" className="btn" onClick={onExport}>
          ⬇ 엑셀 다운로드
        </button>
        <button type="button" className="btn btn--danger-ghost" onClick={onReset}>
          데이터 초기화
        </button>
      </div>
    </div>
  )
}
