import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatNumber } from '../../utils/format'
import '../dashboard/SummaryCards.css'

const TYPE_COLORS = {
  취소: { color: '#b45309', bg: '#fffbeb' },
  반품: { color: '#dc2626', bg: '#fef2f2' },
  교환: { color: '#3457d5', bg: '#eaf0ff' },
}
const DEFAULT_COLOR = { color: '#475569', bg: '#f1f5f9' }

export default function CancelReturnSummaryCards({ summary }) {
  return (
    <>
      <Card className="summary-card">
        <div className="summary-card__icon">↩️</div>
        <div>
          <p className="summary-card__label">선택기간 신청 건수</p>
          <p className="summary-card__value">{formatNumber(summary.totalCount)}건</p>
        </div>
      </Card>

      <Card className="summary-card">
        <div className="summary-card__icon">📦</div>
        <div>
          <p className="summary-card__label">선택기간 신청 수량</p>
          <p className="summary-card__value">{formatNumber(summary.totalQty)}권</p>
        </div>
      </Card>

      <Card title="구분별 현황">
        {summary.byType.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-faint)', fontSize: 13 }}>데이터 없음</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {summary.byType.map(({ type, count }) => {
              const style = TYPE_COLORS[type] || DEFAULT_COLOR
              return <Badge key={type} label={`${type} ${formatNumber(count)}건`} color={style.color} background={style.bg} />
            })}
          </div>
        )}
      </Card>
    </>
  )
}
