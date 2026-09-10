import ExcelUploadButton from '../common/ExcelUploadButton'
import { parseCancelReturnExcelFile } from '../../utils/excelParser'
import { useData } from '../../context/DataContext'
import '../dashboard/FilterBar.css'

const SORT_OPTIONS = [
  { value: 'count', label: '건수순' },
  { value: 'qty', label: '수량순' },
]

export default function CancelReturnFilterBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  sortKey,
  onSortChange,
  claimType,
  onClaimTypeChange,
  claimTypeOptions,
  channel,
  onChannelChange,
  channelOptions,
  onExport,
  onReset,
}) {
  const { uploadCancelReturns } = useData()

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
          <label className="field-label">구분</label>
          <select className="field-select" value={claimType} onChange={(e) => onClaimTypeChange(e.target.value)}>
            <option value="all">전체</option>
            {claimTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
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
      </div>

      <div className="filter-bar__group">
        <ExcelUploadButton
          label="📄 취소/반품 파일 업로드"
          recordLabel="취소·반품 내역"
          recordsKey="cancelReturns"
          parseFn={parseCancelReturnExcelFile}
          onImport={uploadCancelReturns}
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
