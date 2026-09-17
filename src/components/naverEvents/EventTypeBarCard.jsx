import Card from '../common/Card'
import { formatNumber } from '../../utils/format'
import '../dashboard/ChannelBarCard.css'

// aggregation.js의 computeEventTypeBreakdown이 이미 상위 3개 + "기타"로 묶어서
// 최대 4개까지만 넘겨주므로, dataviz 팔레트 카테고리 1~4번 슬롯(파랑/주황/
// 아쿠아/노랑)을 그대로 쓴다. ChannelBarCard와 같은 시각 스타일이라 CSS도
// 그대로 재사용한다.
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100']

export default function EventTypeBarCard({ data, title = '이벤트 유형별 비중' }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="summary-card channel-bar-card">
      <div className="channel-bar-card__body">
        <p className="summary-card__label">{title}</p>
        <div className="channel-bar-card__track">
          {data.map((d, i) => {
            const pct = total > 0 ? (d.count / total) * 100 : 0
            return (
              <div
                key={d.type}
                className="channel-bar-card__segment"
                style={{ width: `${pct}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                title={`${d.type} ${formatNumber(d.count)}건 (${pct.toFixed(1)}%)`}
              />
            )
          })}
        </div>
        <div className="channel-bar-card__legend">
          {data.map((d, i) => {
            const pct = total > 0 ? (d.count / total) * 100 : 0
            return (
              <span key={d.type} className="channel-bar-card__legend-item">
                <span className="channel-bar-card__dot" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                {d.type} {pct.toFixed(0)}%
              </span>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
