import { formatNumber } from '../../utils/format'
import { formatDateDisplay } from '../../utils/dateUtils'
import { normalizeChannel } from '../../utils/aggregation'
import '../orderManagement/OrderSidePanel.css'

// 신청일/사유/처리상태 같은 세부 항목은 업로드한 파일에 따라 아예 없을 수
// 있다("취소" 상태만 있고 신청일·사유가 없는 주문 파일에서 자동 감지된
// 건 등). 값이 없다고 "-"만 보여주면 버그처럼 보이니, 지금은 데이터
// 자체가 없어서 못 보여준다는 걸 명확히 안내한다.
const NOT_LINKED_YET = '데이터 이전 고도화 예정'

export default function CancelReturnDetailView({ record, onClose }) {
  return (
    <aside className="order-panel">
      <div className="order-panel__header">
        <h3>취소/반품 요청 상세</h3>
        <button type="button" className="order-panel__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>

      <section className="order-panel__section">
        <h4>기본 정보</h4>
        <dl className="order-panel__dl">
          <dt>신청일</dt>
          <dd>{record.claimDate ? formatDateDisplay(record.claimDate) : NOT_LINKED_YET}</dd>
          <dt>교재명</dt>
          <dd>{record.productName}</dd>
          <dt>수량</dt>
          <dd>{formatNumber(record.quantity)}</dd>
          <dt>구분</dt>
          <dd>{record.claimType || '미지정'}</dd>
          <dt>판매채널</dt>
          <dd>{record.channel ? normalizeChannel(record.channel) : '-'}</dd>
        </dl>
      </section>

      <section className="order-panel__section">
        <h4>처리 정보</h4>
        <dl className="order-panel__dl">
          <dt>사유</dt>
          <dd>{record.reason && record.reason !== '-' ? record.reason : NOT_LINKED_YET}</dd>
          <dt>처리상태</dt>
          <dd>{record.status || '미확인 (담당자 처리 대기)'}</dd>
        </dl>
        {record.source === 'order-file' && (
          <p className="order-panel__muted">
            ※ 이 건은 주문 파일의 배송상태가 "취소"라서 자동으로 잡힌 건입니다. 사유/처리상태까지 채우려면 네이버
            "취소/반품/교환 관리" 파일을 이 화면에서 별도로 올려주세요.
          </p>
        )}
      </section>
    </aside>
  )
}
