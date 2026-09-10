import Card from '../common/Card'
import { formatNumber } from '../../utils/format'
import './ChannelBarCard.css'

// 채널이 최대 3개(네이버쇼핑/토크스테이션/기타)뿐이라, 원형 그래프보다
// 한 줄짜리 가로 막대(100% 스택 바)가 옆의 요약 카드들과 높이가 잘
// 맞고 자리도 덜 차지한다. 색상은 dataviz 팔레트의 카테고리 1~3번
// 슬롯(파랑/주황/아쿠아) — 3개까지는 전 조합 CVD 검증을 통과한 순서.
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a']

export default function ChannelBarCard({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="summary-card channel-bar-card">
      <div className="channel-bar-card__body">
        <p className="summary-card__label">채널별 비중</p>
        <div className="channel-bar-card__track">
          {data.map((d, i) => {
            const pct = total > 0 ? (d.count / total) * 100 : 0
            return (
              <div
                key={d.channel}
                className="channel-bar-card__segment"
                style={{ width: `${pct}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                title={`${d.channel} ${formatNumber(d.count)}건 (${pct.toFixed(1)}%)`}
              />
            )
          })}
        </div>
        <div className="channel-bar-card__legend">
          {data.map((d, i) => {
            const pct = total > 0 ? (d.count / total) * 100 : 0
            return (
              <span key={d.channel} className="channel-bar-card__legend-item">
                <span className="channel-bar-card__dot" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                {d.channel} {pct.toFixed(0)}%
              </span>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
