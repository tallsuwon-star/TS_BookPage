import Card from '../common/Card'
import { formatNumber } from '../../utils/format'
import './SummaryCards.css'

export default function SummaryCards({ summary }) {
  const items = [
    { label: '선택기간 주문건', value: formatNumber(summary.orderCount), unit: '건', icon: '🧾' },
    { label: '선택기간 주문금액', value: formatNumber(summary.orderAmount), unit: '원', icon: '💰' },
    { label: '선택기간 출고수량', value: formatNumber(summary.shippedQty), unit: '권', icon: '📦' },
  ]

  return (
    <>
      {items.map((item) => (
        <Card key={item.label} className="summary-card">
          <div className="summary-card__icon">{item.icon}</div>
          <div className="summary-card__body">
            <p className="summary-card__label">{item.label}</p>
            <p className="summary-card__value">
              {item.value}
              {item.unit}
            </p>
          </div>
        </Card>
      ))}
    </>
  )
}
