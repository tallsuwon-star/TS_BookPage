# 교재 주문 관리 대시보드

네이버 스마트스토어에서 다운로드한 엑셀 파일을 업로드하면 교재별 주문/취소·반품
현황과 재고 상태를 자동으로 집계해 보여주는 정적(프론트엔드 only) 사이트입니다.
React + Vite로 만들어졌고, GitHub Pages에 정적 사이트로 배포합니다.

화면은 사이드바의 "교재상품 관리" 그룹 안에 3개가 있습니다.
- **교재주문 대시보드** (`/payment-check`) — 발주발송관리 엑셀 업로드 → 기간별 주문 집계/재고 현황
- **교재 주문/재고관리** (`/order-management`) — 같은 주문 데이터를 집계 없이 한 건씩 나열하는 원장 화면, 송장처리/주문상세 패널
- **주문 취소/반품 관리** (`/cancel-return`) — 취소/반품 엑셀 업로드 → 취소·반품 집계/내역 조회

세 화면은 같은 Context(전역 상태)를 공유하므로, 어느 화면에서
"파일로 정보입력"을 하든(교재상품 결제확인/교재 주문 재고관리 모두 같은
`orders`를 사용) 사이드바를 왔다갔다 해도 데이터가 그대로 유지되고 다른
화면에도 자동으로 반영됩니다.

**"교재 주문 재고관리" 화면(및 "송장 처리"/"주문 상세" 패널)에는 주문자
이름/연락처/이메일/배송지 주소 등 개인정보(PII)를 절대 표시하지 않습니다.**
실제 네이버 발주발송관리 파일에는 이런 정보가 들어있지만, 이 프로젝트의
파서(`columnAliases.js`)는 애초에 PII 열을 필드로 정의하지 않아 파싱
단계에서부터 읽어들이지 않습니다. 화면에는 교재명/구매처/결제금액 등
비식별 정보만 순번(NO)과 함께 표시되고, 실제 배송에 필요한 수령인/주소는
"비공개 (개인정보 보호)"로 표시됩니다 — 실제 발송 작업은 엑셀 원본 파일을
직접 열어 확인해야 합니다. 택배사 시스템과의 자동 연동(송장번호 자동 발급 등)도
지원하지 않아 택배사/송장번호는 담당자가 직접 입력합니다.

**엑셀 업로드 버튼("파일로 정보입력")을 누르면 파일 선택 창이 뜨기 직전에
항상 확인 창이 한 번 뜹니다** ("이 페이지는 보호되지 않아, 개인정보를 올릴
경우 대단한 큰일이 납니다...") — 이 사이트는 로그인/권한 보호가 없는 완전
공개 페이지라, 실수로 개인정보가 포함된 원본 파일을 그대로 올리는 걸
막기 위한 마지막 안전장치입니다(`src/components/common/ExcelUploadButton.jsx`).
취소를 누르면 업로드가 진행되지 않습니다.

**"주문취소/반품관리" 화면은 두 경로의 데이터를 합쳐서 보여줍니다**: ①
전용 "취소/반품/교환 관리" 파일을 업로드한 내역, ② 발주발송관리(주문) 파일의
배송상태 열에 "취소"라는 문구가 포함된 행을 자동으로 감지한 내역
(`extractCancelledFromOrders`, `src/utils/aggregation.js`). ②는 매번 저장하지
않고 현재 `orders` 데이터로부터 화면에서 즉시 계산하는 값이라 화면에
"자동감지" 표시가 붙습니다. 따라서 "데이터 초기화" 버튼은 ①(직접 업로드한
내역)만 지우고, ②는 "교재상품 결제확인/교재 주문 재고관리" 쪽에서 주문
데이터 자체를 초기화해야 함께 사라집니다.

> ⚠️ 이번 범위에서는 다음 기능은 포함하지 않았습니다 (기획안 대비 축소 범위):
> "3+1 / 10원 이벤트" 주문 분류, 실제 송장 처리/인쇄, CJ대한통운 연동,
> 네이버 API 자동 연동(계속 엑셀 업로드 방식), 상담관리/문자 자동 발송.
> 모두 별도 백엔드가 필요한 기능이라 추후 고도화 시 진행할 예정입니다.

---

## ⚠️ 반드시 읽어주세요 (보안 / 개인정보)

이 프로젝트는 별도 백엔드 서버 없이 **GitHub 저장소의 `data.json` 파일을
공유 데이터 저장소처럼** 사용합니다. 브라우저에서 GitHub REST API(Contents
API)를 직접 호출해 파일을 읽고 쓰기 때문에, 다음 사항을 반드시 지켜야 합니다.

1. **이 저장소 전용 Fine-grained Personal Access Token만 사용할 것.**
   GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens 에서, **Repository access를 "Only select
   repositories"로 지정하고 이 저장소 하나만 선택**하세요. Permissions는
   **Contents: Read and write** 하나만 부여하면 충분합니다. 여러 저장소/조직
   권한이 포함된 토큰이나 Classic Token은 절대 사용하지 마세요.
2. **이 저장소는 반드시 Private으로 유지하세요.** `VITE_GITHUB_TOKEN`은
   빌드 결과물(JS 번들)에 그대로 문자열로 포함되어, 배포된 사이트의 소스를
   보면 누구나 값을 확인할 수 있습니다. 즉 이 대시보드는 **팀 내부
   테스트/사내용**으로만 사용해야 하며, 외부에 공개되는 서비스로 운영하면
   안 됩니다.
   - 참고로 GitHub Pages는 조직 플랜에 따라 Private 저장소여도 배포된
     사이트 자체(`https://<owner>.github.io/...`)는 인증 없이 열람 가능한
     경우가 있습니다. Pages 방문 제한(Enterprise의 Private Pages 등)을
     지원하지 않는 플랜이라면, 배포 URL을 아무나 접근하지 못하도록
     별도로 통제(예: 사내망에서만 접근하는 URL 공유, 조직 SSO 등)하거나,
     테스트가 끝나면 Pages 배포를 비활성화하는 것을 권장합니다.
3. **실제 회원 개인정보(이름, 연락처, 이메일 등)는 이 저장소(`data.json`)에
   절대 올리지 마세요.** 이번 사이트는 "교재 주문/취소·반품 집계"만을 목적으로
   상품명/수량/가격/채널/상태 등만 저장하며, 업로드하는 엑셀 파일에 회원
   이름·연락처 열이 포함되어 있더라도 코드에서 해당 열은 아예 추출하지
   않습니다. 만약 회원 개인정보까지 다뤄야 하는 시점이 오면, 이 방식(GitHub
   저장소를 DB처럼 쓰는 방식)을 계속 쓰면 안 되고 Supabase/Firebase 등
   **별도 인증/권한 관리가 되는 백엔드로 전환**해야 합니다.

같은 경고 주석이 `src/services/githubStorage.js` 상단에도 있습니다.

---

## 기술 스택

- **React 19 + Vite** — 정적 SPA, GitHub Pages 배포
- **xlsx (SheetJS)** — 네이버 발주발송관리 엑셀 파싱
- **React Context API** — 화면(사이드바 메뉴) 전환에도 주문/재고 데이터 유지
- **recharts** — 채널별 주문 비중 도넛차트
- **react-router-dom (HashRouter)** — GitHub Pages 새로고침 404 이슈 없이
  화면 라우팅 (앞으로 추가될 사이드바 메뉴들을 위한 구조)

## 폴더 구조

```
src/
  main.jsx, App.jsx           앱 진입점 / 라우팅 정의
                               (/payment-check, /order-management, /cancel-return)
  index.css                   전역 디자인 토큰 & 공통 버튼/폼 스타일
  layout/                     AppLayout, Sidebar, 사이드바 메뉴 설정(menuConfig.js)
  pages/
    DashboardPage/            "교재상품 결제확인" 화면 (기간별 집계)
    OrderManagementPage/      "교재 주문 재고관리" 화면 (주문 원장 목록)
    CancelReturnPage/         "주문취소/반품관리" 화면
  components/
    common/                   Card, Badge, SearchInput, ExcelUploadButton,
                               ColumnMappingPreview, DataTable.css 등
                               여러 화면이 공통으로 쓰는 UI 조각
    dashboard/                결제확인 화면 전용 조각 (필터바, 카드, 표,
                               현재재고 입력/망실처리 모달 등)
    orderManagement/          교재 주문 재고관리 화면 전용 조각 (필터바, 원장 표,
                               송장처리/주문상세 패널)
    cancelReturn/             취소/반품관리 화면 전용 조각
  context/
    DataContext.jsx           orders/inventory/cancelReturns 전역 상태 + GitHub 동기화 액션
  services/
    githubStorage.js          GitHub Contents API 읽기/쓰기 (data.json)
  utils/
    excelParser.js            엑셀 파싱 공통 파이프라인 (컬럼 자동 인식 + R열 폴백)
    columnAliases.js          주문/취소반품 각각의 필드-헤더 별칭 정의
    aggregation.js             기간/채널/구분 필터링, 집계, 정렬 로직 (주문 + 취소반품)
    inventoryStatus.js         재고상태(정상/주의/재고부족) 판정 규칙
    dateUtils.js, format.js    날짜/숫자 포맷 유틸
    exportExcel.js             엑셀 다운로드 (주문 집계 / 취소반품 집계)
```

새 화면을 추가할 때는 `pages/`에 폴더를 만들고, `App.jsx`의 `<Routes>`와
`layout/menuConfig.js`의 `MENU_ITEMS`에 등록하면 사이드바에 자동으로
노출됩니다. (현재 "재고 관리 / 설정"은 향후 확장을 위해 "준비중" 상태로
사이드바에 미리 자리를 잡아두었습니다.)

엑셀 업로드가 필요한 새 화면을 또 추가하게 되면 `ExcelUploadButton` +
`ColumnMappingPreview`(둘 다 `components/common/`)를 그대로 재사용하고,
`columnAliases.js`에 그 화면 전용 필드 정의(`XXX_FIELD_DEFS`)와
`excelParser.js`에 파서 함수만 하나 추가하면 됩니다 (`parseCancelReturnExcelFile`
가 그 예시입니다).

## data.json 데이터 구조

```json
{
  "orders": [
    {
      "id": "row3-0",
      "orderDate": "2026-09-01",
      "productName": "수학의 정석 (상)",
      "quantity": 2,
      "price": 15000,
      "channel": "스마트스토어",
      "deliveryStatus": "배송완료"
    }
  ],
  "inventory": {
    "수학의 정석 (상)": { "currentStock": 120, "safetyStock": 30, "category": "고등수학", "lossQty": 2 }
  },
  "shippingInfo": {
    "row3-0": {
      "courier": "CJ대한통운",
      "trackingNumber": "123-456-7890",
      "status": "발송중",
      "processedBy": "관리자",
      "processedAt": "2026-09-09T05:11:34.000Z"
    }
  },
  "cancelReturns": [
    {
      "id": "cr-row2-0",
      "claimDate": "2026-09-02",
      "productName": "수학의 정석 (상)",
      "quantity": 1,
      "claimType": "취소",
      "reason": "단순변심",
      "status": "완료",
      "channel": "스마트스토어"
    }
  ],
  "updatedAt": "2026-09-09T00:00:00.000Z"
}
```

- `orders`/`cancelReturns`는 각각 **파일을 새로 업로드할 때마다 통째로
  교체**됩니다. (여러 파일을 누적/병합하는 기능은 이번 범위에 없습니다.
  항상 최신 다운로드 파일 전체를 업로드해주세요.) 두 배열은 서로 독립적이라
  한쪽을 업로드/초기화해도 다른 쪽 데이터에는 영향이 없습니다.
- `inventory`의 `currentStock`(현재재고)/`safetyStock`(안전재고)는 주문
  파일에 없는 정보라 대시보드 표에서 직접 입력합니다.
- `currentStock`은 표 안에서 바로 수정할 수 없고, "전체 교재 수량 현황"
  카드 상단의 **"현재재고 입력"** 버튼을 눌러 여는 별도 창에서만 기록/수정할
  수 있습니다 (창 하단에 "교재관리 담당자만 기록/수정할 수 있습니다" 문구
  표시). 아무나 표를 스치듯 잘못 눌러 재고 값이 바뀌는 걸 막기 위한
  장치이며, 실제 로그인/권한 시스템은 아니라 문구로만 안내합니다.
- 담당자가 아닌 사람이 분실/파손 등으로 판매 불가능해진 소량(1~2권)을
  반영하고 싶을 때는 각 행의 **"망실처리"** 버튼으로 `lossQty`(망실 수량)를
  누적 기록합니다. 표에 보이는 현재재고는 `currentStock - lossQty`로
  계산된 값이라, 담당자가 기록한 `currentStock` 원본 값 자체는 바뀌지
  않습니다.
- `shippingInfo`는 "교재 주문 재고관리" 화면에서 "송장처리"를 완료하거나
  "주문상세" 창에서 배송상태를 바꾸면 주문 `id`를 키로 기록됩니다. 주문
  파일을 다시 업로드하면 행마다 새 `id`(`row{행}-{순번}`)가 매겨지므로,
  재업로드 후에는 이전에 기록해둔 송장처리 내역과 매칭되지 않는다는 점에
  유의하세요 (재고 데이터와 동일한 제약입니다).
- "교재구분" 필터(아이딕 파닉스/보카킹/아이딕 익스플로러/기타)는 더 이상
  수동 입력값이 아니라 **상품명 키워드로 자동 분류**됩니다
  (`classifyBookCategory`, `src/utils/columnAliases.js`). `data.json`에
  `category` 필드를 따로 저장하지 않고 화면에서 상품명을 보고 매번
  계산합니다. 새 교재 시리즈가 생기면 이 함수에 키워드만 추가하면 됩니다.
- "판매채널"/"구매처" 필터(네이버쇼핑/토크스테이션/기타)도 마찬가지로
  원본 채널 문자열(스마트스토어, 자사몰 등)을 고정된 3가지로 자동
  분류합니다(`normalizeChannel`, `src/utils/aggregation.js`).

## 엑셀 파싱 관련 참고사항

- 네이버 발주발송관리 파일은 **A~BK(63열)까지가 실제 데이터**이므로,
  파싱 시 시트의 사용범위(`!ref`)가 그보다 좁게 잡혀 있어도 항상 63열까지
  강제로 읽도록 구현했습니다 (`src/utils/excelParser.js`).
- 필요한 6개 항목(주문일/상품명/수량/상품가격/판매채널/배송상태)은 헤더
  문구로 자동 탐색합니다. 다만 실제 파일의 정확한 헤더 문구를 확인하지
  못한 상태로 작성했기 때문에, 상품가격만은 사용자가 알려준 **R열을
  최종 폴백**으로 지정해두었습니다.
- 업로드 시 "엑셀 열 매핑 확인" 팝업에서 어떤 열이 어떤 항목으로 인식됐는지
  보여줍니다. 만약 실제 파일과 다르게 인식된 항목이 있다면 알려주시면
  헤더 별칭(`columnAliases.js`)을 수정해 드릴 수 있습니다.
- "주문취소/반품관리" 화면은 네이버 "취소/반품/교환 관리" 다운로드 파일을
  올린다고 가정하고 신청일/상품명/수량/구분(취소·반품·교환)/사유/처리상태/
  판매채널 7개 항목을 헤더 별칭으로 자동 인식합니다(`CANCEL_RETURN_FIELD_DEFS`).
  이 파일의 정확한 열 구성을 확인하지 못한 상태로 작성했으므로, 실제 파일을
  업로드해보고 매핑이 다르게 잡히면 알려주세요.

### 교재 주문만 골라내는 필터 (TEXTBOOK_NAME_KEYWORDS)

실제 발주발송관리 파일로 확인해보니, 이 파일에는 교재 주문뿐 아니라
**화상영어 수강권, 10원 체험 이벤트, 3+1 이벤트** 등 완전히 다른 상품
주문도 함께 섞여 내려옵니다. 그래서 업로드 시 상품명에 특정 키워드가
포함된 행만 "교재 주문"으로 인정하고, 나머지는 파싱 단계에서 자동으로
제외하도록 만들었습니다.

- 현재 키워드 목록(`src/utils/columnAliases.js`의 `TEXTBOOK_NAME_KEYWORDS`):
  `idic`, `아이딕`, `파닉스`, `phonics`, `explorer`, `익스플로러`
  (대소문자 구분 없이 상품명에 포함되어 있으면 매칭)
- 새 교재 시리즈가 출시되면 이 배열에 키워드만 추가하면 됩니다.
- 업로드 시 뜨는 "엑셀 열 매핑 확인" 팝업에 "교재가 아닌 상품 N건 제외됨"
  문구로 몇 건이 걸러졌는지 항상 보여줍니다.
- "주문취소/반품관리" 업로드에도 동일한 필터가 적용됩니다.

## 로컬 개발

```bash
npm install
cp .env.example .env   # 값 채우기 (아래 "GitHub 연동 설정" 참고)
npm run dev
```

## GitHub 연동 설정 (.env)

```
VITE_GITHUB_TOKEN=발급받은_Fine-grained_PAT
VITE_GITHUB_OWNER=tallsuwon-star
VITE_GITHUB_REPO=TsBookPage
VITE_GITHUB_BRANCH=main
VITE_DATA_FILE_PATH=data.json
```

`.env`는 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

## GitHub Pages 배포

`.github/workflows/deploy.yml`이 `main` 브랜치 푸시 시 자동으로 빌드하여
GitHub Pages에 배포하도록 구성되어 있습니다. 최초 1회만 아래 설정이
필요합니다.

1. 저장소 **Settings → Secrets and variables → Actions → New repository
   secret**에서 `VITE_GITHUB_TOKEN` 값을 등록하세요. (로컬 `.env`에 쓴
   것과 동일한, 이 저장소 전용 토큰)
2. 저장소 **Settings → Pages → Build and deployment → Source**를
   **"GitHub Actions"**로 설정하세요.
3. 이후 `main` 브랜치에 푸시하면 자동으로 빌드/배포됩니다. (수동 실행은
   Actions 탭에서 `Deploy to GitHub Pages` 워크플로를 `workflow_dispatch`로
   실행하면 됩니다.)

배포 경로는 `https://<owner>.github.io/TsBookPage/` 형태이며, 이에 맞춰
`vite.config.js`의 `base`를 `/TsBookPage/`로 고정해두었습니다. 저장소 이름을
바꾸면 이 값도 함께 수정해야 합니다.

## 알려진 제한사항

- 3+1 / 10원 이벤트 주문 분류는 미포함 (추후 고도화 예정)
- 파일 업로드는 "전체 교체" 방식이며 여러 파일 누적/병합은 지원하지 않음
- `xlsx` 패키지는 npm 감사(`npm audit`)에서 알려진 취약점(프로토타입 오염,
  ReDoS)이 보고되지만 아직 공식 패치가 없는 상태입니다. 사내 신뢰된
  사용자가 업로드하는 자체 다운로드 파일만 다루는 용도로는 허용 가능한
  수준으로 판단했으나, 출처가 불분명한 엑셀 파일은 업로드하지 마세요.
