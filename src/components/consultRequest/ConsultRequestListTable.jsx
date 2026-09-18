import Card from '../common/Card'
import Badge from '../common/Badge'
import { CONSULT_STATUS_STYLE, countPendingConsultRequests, sortConsultRequests } from '../../utils/consultRequests'
import '../common/DataTable.css'
import './ConsultRequestListTable.css'

const DEFAULT_STATUS_STYLE = { color: '#475569', bg: '#f1f5f9' }

export default function ConsultRequestListTable({ records, onOpenDetail }) {
  const pendingCount = countPendingConsultRequests(records)
  const sortedRecords = sortConsultRequests(records)

  return (
    <Card title="상담 요청 목록" className="data-table-card">
      <div className="consult-request-banner">대기중 요청: {pendingCount}건</div>
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>요청일시</th>
              <th>작성자</th>
              <th>회원이름</th>
              <th>회원아이디</th>
              <th>상담유형</th>
              <th>상담내용</th>
              <th>담당자</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 && (
              <tr>
                <td colSpan={9} className="data-table__empty">
                  등록된 상담 요청이 없습니다.
                </td>
              </tr>
            )}
            {sortedRecords.map((r) => {
              const style = CONSULT_STATUS_STYLE[r.status] || DEFAULT_STATUS_STYLE
              return (
                <tr key={r.id}>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '-'}</td>
                  <td>{r.requestedBy || '-'}</td>
                  <td>{r.memberName || '-'}</td>
                  <td>{r.memberIdentifier || '-'}</td>
                  <td>
                    {r.consultType || '미지정'}
                    {r.urgent && <span className="data-table__tag">긴급</span>}
                  </td>
                  <td className="data-table__name">{r.content || '-'}</td>
                  <td>{r.assignee || '미배정'}</td>
                  <td>
                    <Badge label={r.status || '상담대기'} color={style.color} background={style.bg} />
                  </td>
                  <td>
                    <button type="button" className="btn btn--ghost btn--table-action" onClick={() => onOpenDetail(r)}>
                      상담상세
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
