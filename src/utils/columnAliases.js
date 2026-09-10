// 네이버 스마트스토어 발주발송관리 엑셀은 셀러 화면 설정이나 다운로드 시점에 따라
// 헤더 문구가 조금씩 달라질 수 있어, 필드별로 가능한 헤더 후보를 나열해두고
// 앞에서부터 우선순위로 매칭한다. (완전일치 우선, 없으면 부분일치)
export const FIELD_DEFS = [
  { key: 'orderDate', label: '주문일', aliases: ['주문일시', '주문일', '결제일시', '결제일'] },
  { key: 'productName', label: '상품명(교재명)', aliases: ['상품명', '옵션명', '교재명'] },
  { key: 'quantity', label: '수량', aliases: ['수량', '옵션수량', '구매수량'] },
  // 사용자가 실제 파일에서 직접 확인한 열: R열(0-index 17) = 상품가격.
  // 헤더 문구로 우선 탐색하되, 못 찾으면 R열로 강제 지정한다.
  { key: 'price', label: '상품가격', aliases: ['상품가격', '판매가', '옵션가', '단가'], fallbackColumnIndex: 17 },
  { key: 'channel', label: '판매채널', aliases: ['판매채널', '채널', '주문채널'] },
  { key: 'deliveryStatus', label: '배송상태', aliases: ['배송상태', '처리상태', '주문상태'] },
]

// ⚠️ 주문자명/연락처/이메일/주문번호/주소 — 팀 확인 결과(2026-09-10) 실제
// 업로드하는 파일은 항상 사전에 가명·임의 연락처로 치환해둔 파일이라 실제
// 회원 개인정보가 아니므로, "교재 주문/재고관리"의 송장처리/주문상세/반품접수
// 화면에서 그대로(마스킹 없이) 표시한다. 이 전제가 바뀌면(실제 개인정보가
// 포함된 파일을 올리게 되면) 반드시 다시 마스킹하거나 제거해야 한다.
// (주소는 반품 접수 시 원래 배송지를 자동으로 채워주기 위해 2026-09-10에
// 추가로 포함하기로 했다. 그 전까지는 의도적으로 수집하지 않았다.)
// FIELD_DEFS와 분리해둔 이유: 파일마다 있을 수도 없을 수도 있는 항목이라
// 없다고 해서 "필수 항목을 찾지 못했다"는 경고를 띄우면 안 되기 때문이다.
export const ORDER_EXTRA_FIELD_DEFS = [
  { key: 'orderNumber', label: '주문번호', aliases: ['주문번호', '상품주문번호'] },
  { key: 'buyerName', label: '구매자명(수취인명)', aliases: ['구매자명', '수취인명', '수령인명', '수령인'] },
  { key: 'phone', label: '연락처', aliases: ['수취인연락처1', '수취인연락처', '연락처', '휴대폰번호', '전화번호'] },
  { key: 'email', label: '이메일', aliases: ['이메일', '구매자이메일', 'e-mail', 'email'] },
  {
    key: 'address',
    label: '주소',
    aliases: ['통합배송지', '배송지', '수취인주소', '기본배송지', '배송지주소', '주소'],
  },
  // 팀에서 발주발송관리 시트에 직접 "구분"이라는 열을 추가해 3+1/10원/기타
  // 이벤트 여부를 미리 계산해 두는 경우가 있다. 있으면 그 값을 그대로 가져와
  // "네이버 이벤트 주문건" 화면에서 묶어 보여주는 데 쓴다(classifyEventType 참고).
  { key: 'eventType', label: '구분(이벤트유형)', aliases: ['구분'] },
]

// 발주발송관리 원본은 A~BK, 즉 63개 열까지가 실제 데이터다.
// 헤더가 비어 있는 열이 섞여 있어도 시트 파싱 시 절대 여기서 줄이면 안 된다.
export const NAVER_EXPORT_MIN_COLUMNS = 63

// 네이버 스마트스토어 "리뷰 관리" 다운로드 파일용 필드 정의.
// ⚠️ 아직 실제 파일 형식을 받지 못해 우선 주문번호(주문상세번호) 하나만
// 필수로 잡아둔다. 이 파일에 등장하는 주문번호는 전부 "리뷰를 작성한
// 주문"으로 간주한다(네이버 리뷰 다운로드는 보통 리뷰가 달린 주문만
// 내려주는 방식이라는 전제). 실제 파일을 받으면 리뷰작성일/평점 등도
// 추가로 반영할 수 있다. 담당자 확인 결과(2026-09-10) 파일이 계속
// 쌓이면 data.json이 무거워질 수 있어, 원본 행 전체가 아니라 주문번호만
// 뽑아서 최소한으로 저장한다(excelParser.js의 parseReviewExcelFile 참고).
export const REVIEW_FIELD_DEFS = [
  { key: 'orderNumber', label: '주문번호(주문상세번호)', aliases: ['주문번호', '상품주문번호', '주문상세번호'] },
]

// 네이버 스마트스토어 "클레임(취소/반품/교환) 관리" 다운로드 파일용 필드 정의.
// 정확한 열 문구를 확인하지 못한 상태라 후보를 넓게 잡아두었고, 못 찾으면
// 업로드 시 뜨는 "엑셀 열 매핑 확인" 팝업에서 사용자가 직접 확인할 수 있다.
// ⚠️ 회원 이름/연락처 등 개인정보에 해당하는 열은 절대 추가하지 말 것.
export const CANCEL_RETURN_FIELD_DEFS = [
  { key: 'claimDate', label: '신청일', aliases: ['클레임접수일', '접수일', '신청일', '취소일', '반품일', '요청일'] },
  { key: 'productName', label: '상품명(교재명)', aliases: ['상품명', '옵션명', '교재명'] },
  { key: 'quantity', label: '수량', aliases: ['수량', '클레임수량', '옵션수량'] },
  { key: 'claimType', label: '구분(취소/반품/교환)', aliases: ['클레임구분', '처리유형', '클레임유형', '유형', '구분'] },
  { key: 'reason', label: '사유', aliases: ['클레임사유', '반품사유', '취소사유', '사유', '상세사유'] },
  { key: 'status', label: '처리상태', aliases: ['클레임상태', '진행상태', '처리상태', '처리현황'] },
  { key: 'channel', label: '판매채널', aliases: ['판매채널', '채널', '주문채널'] },
]

// 네이버 발주발송관리 파일에는 교재(책) 주문뿐 아니라 화상영어 수강권,
// 체험 이벤트(예: 10원 체험, 3+1 이벤트) 등 전혀 다른 상품이 섞여서 내려온다.
// "교재상품 결제확인" 화면에는 실제 교재 주문만 집계되어야 하므로, 상품명에
// 아래 키워드가 포함된 행만 "교재 주문"으로 인정한다. 나머지(교재가 아닌
// 행)는 이제 버리지 않고 "네이버 이벤트 주문건" 화면에서 확인할 수 있다.
// 새 교재 시리즈가 나오면 이 배열에 키워드만 추가하면 된다.
export const TEXTBOOK_NAME_KEYWORDS = ['idic', '아이딕', '파닉스', 'phonics', 'explorer', '익스플로러', '보카킹']

export function isTextbookProduct(productName) {
  const name = String(productName || '').toLowerCase()
  return TEXTBOOK_NAME_KEYWORDS.some((keyword) => name.includes(keyword.toLowerCase()))
}

// 교재가 아닌 주문(네이버 이벤트 주문건)을 "구분" 값 기준으로 묶어서 보여줄
// 때 쓰는 분류. 팀이 시트에 미리 계산해 둔 값(예: "3+1", "10원", "기타",
// "중복")을 그대로 쓰고, 그 열이 없거나 비어 있으면 "미분류"로 묶는다.
export function classifyEventType(rawEventType) {
  const raw = String(rawEventType || '').trim()
  return raw || '미분류'
}

// "교재구분" 필터를 상품명 기준으로 자동 분류한다. 예전에는 재고 표에서
// 직접 입력하는 값이었지만(현재는 그 입력 UI 자체가 없음), 상품명만으로
// 항상 같은 값이 나오도록 고정된 4개 구분으로 바꿨다.
export const BOOK_CATEGORIES = ['아이딕 파닉스', '보카킹', '아이딕 익스플로러', '기타']

export function classifyBookCategory(productName) {
  const name = String(productName || '').toLowerCase()
  if (name.includes('파닉스') || name.includes('phonics')) return '아이딕 파닉스'
  if (name.includes('보카킹')) return '보카킹'
  if (name.includes('익스플로러') || name.includes('explorer')) return '아이딕 익스플로러'
  return '기타'
}
