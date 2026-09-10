import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../common/Card'
import { formatNumber } from '../../utils/format'

const COLORS = ['#3457d5', '#22c1a4', '#f5a524', '#ef5da8', '#8b5cf6', '#64748b']

export default function ChannelDonutCard({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card title="채널별 주문 비중" className="channel-donut-card">
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="channel"
              innerRadius={42}
              outerRadius={64}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.channel} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${formatNumber(value)}건 (${((value / total) * 100).toFixed(1)}%)`, name]}
            />
            <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
