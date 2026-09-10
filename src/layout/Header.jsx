import { useData } from '../context/DataContext'
import './Header.css'

// 기존 톡스 LMS 관리자 페이지의 상단바(GNB) 구성을 참고해 만든 헤더.
// 중앙 정보바의 숫자(수강인원/무료체험/챗봇/콜백 건수)는 실제 데이터와
// 연동되지 않은 표시용 예시 값이며, 대부분의 링크(MO/업공/재수강 등)도
// 이 프로젝트 범위 밖의 기능이라 클릭해도 동작하지 않는다.
const INFO_LINKS = [
  { label: '현재수강인원: 10,314명' },
  { label: '금일무료체험 : 68명' },
  { label: '전체강사스케줄' },
  { label: 'MO' },
  { label: '업공' },
  { label: '홈페이지', href: 'https://talkstation.co.kr' },
  { label: 'Task Sharing Center' },
  { label: '재수강' },
  { label: '통합LMS' },
]

export default function Header() {
  const { loading, syncing, error, lastSyncedAt } = useData()

  return (
    <header className="gnb">
      <div className="gnb__logo">
        톡스 <span className="gnb__logo-accent">admin</span>
        <span className="gnb__logo-sub">교재 주문·재고관리</span>
      </div>

      <div className="gnb__info">
        {INFO_LINKS.map((item, i) => (
          <span key={item.label} className="gnb__info-item">
            {i > 0 && <span className="gnb__info-sep">/</span>}
            {item.href ? (
              <a href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <span className="gnb__info-inert">{item.label}</span>
            )}
          </span>
        ))}
        <span className="gnb__info-sep">/</span>
        <span className="gnb__info-item gnb__info-inert">
          APP 챗봇 : 전체 <span className="gnb__count gnb__count--red">1</span>건
        </span>
        <span className="gnb__info-sep">/</span>
        <span className="gnb__info-item gnb__info-inert">
          콜백 : 미지정 <span className="gnb__count gnb__count--blue">0</span>건
        </span>
      </div>

      <div className="gnb__right">
        {loading && <span className="gnb__status">데이터 불러오는 중...</span>}
        {!loading && syncing && <span className="gnb__status gnb__status--sync">GitHub에 저장 중...</span>}
        {!loading && !syncing && !error && lastSyncedAt && (
          <span className="gnb__status gnb__status--ok">
            마지막 저장 {new Date(lastSyncedAt).toLocaleString('ko-KR')}
          </span>
        )}

        <span className="gnb__pill">TSA LMS</span>
        <span className="gnb__pill">출석체크</span>

        <span className="gnb__msg" title="Messages">
          ✉️<span className="gnb__msg-badge">0</span>
        </span>

        <div className="gnb__user">
          <span className="gnb__user-avatar">👤</span>
          <div className="gnb__user-info">
            <div className="gnb__user-name">Hello, 관리자</div>
            <div className="gnb__user-links">
              <span>View Site</span>
              <span>Modify Profile</span>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
