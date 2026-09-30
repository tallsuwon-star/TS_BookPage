import Card from '../common/Card'
import Badge from '../common/Badge'
import { CONSULT_STATUS_STYLE, formatShortDateTime, sortConsultRequests } from '../../utils/consultRequests'
import '../common/DataTable.css'

const DEFAULT_STATUS_STYLE = { color: '#475569', bg: '#f1f5f9' }

// 타포 실제 "상담 이관" 화면의 표 컬럼(요청일자/회원정보/부서/상담유형/
// 희망일시/상담내용/진행여부/관리)과 1:1로 맞췄다. 회원정보는 이름+연락처를
// 한 셀에 두 줄로 보여주고(타포도 그렇게 함), 상담유형은 배지 없이 일반
// 텍스트다(타포 표에는 배지가 상태 컬럼에만 있음).
export default function ConsultRequestListTable({ records, onOpenDetail, onAutoAssign }) {
  const sortedRecords = sortConsultRequests(records)

  return (
    <Card
      title={`상담 요청 목록 (${records.length}건)`}
      action={
        <button type="button" className="btn btn--table-action" onClick={onAutoAssign}>
          상담대기 담당매니저 자동배정
        </button>
      }
      className="data-table-card"
    >
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>요청일자</th>
              <th>회원정보</th>
              <th>부서</th>
              <th>상담유형</th>
              <th>희망일시</th>
              <th>상담내용</th>
              <th>진행여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 && (
              <tr>
                <td colSpan={8} className="data-table__empty">
                  등록된 상담 요청이 없습니다.
                </td>
              </tr>
            )}
            {sortedRecords.map((r) => {
              const style = CONSULT_STATUS_STYLE[r.status] || DEFAULT_STATUS_STYLE
              return (
                <tr key={r.id}>
                  <td>{formatShortDateTime(r.createdAt)}</td>
                  <td>
                    <div>{r.memberName || '-'}</div>
                    {r.memberIdentifier && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{r.memberIdentifier}</div>
                    )}
                  </td>
                  <td>{r.department || '-'}</td>
                  <td>
                    {r.consultType || '미지정'}
                    {r.urgent && <span className="data-table__tag">긴급</span>}
                  </td>
                  <td>{formatShortDateTime(r.preferredAt)}</td>
                  <td className="data-table__name">{r.content || '-'}</td>
                  <td>
                    <Badge label={r.status || '상담대기'} color={style.color} background={style.bg} />
                  </td>
                  <td>
                    <button type="button" className="btn btn--ghost btn--table-action" onClick={() => onOpenDetail(r)}>
                      상세
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
