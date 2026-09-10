// ---------------------------------------------------------------------------
// ⚠️ 개인정보 및 보안 주의사항
// - 이 파일은 GitHub 저장소의 data.json을 "공유 데이터 저장소"처럼 사용한다.
// - VITE_GITHUB_TOKEN은 빌드 결과물에 그대로 노출되므로, 이 토큰은 반드시
//   "이 저장소 전용" Fine-grained PAT(Contents 권한만)이어야 하며, 이 저장소는
//   반드시 Private으로 유지하고 팀 내부 테스트 용도로만 사용해야 한다.
// - 실제 회원 개인정보(이름, 연락처, 이메일 등)는 data.json에 절대 저장하지
//   말 것. 회원 데이터가 필요해지면 Supabase/Firebase 등 별도 백엔드로 전환할 것.
// ---------------------------------------------------------------------------

const OWNER = import.meta.env.VITE_GITHUB_OWNER
const REPO = import.meta.env.VITE_GITHUB_REPO
const BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main'
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN
const DATA_PATH = import.meta.env.VITE_DATA_FILE_PATH || 'data.json'

export const EMPTY_DATA = { orders: [], inventory: {}, cancelReturns: [], shippingInfo: {}, updatedAt: null }

export function isGithubStorageConfigured() {
  return Boolean(OWNER && REPO && TOKEN)
}

function assertConfigured() {
  if (!isGithubStorageConfigured()) {
    throw new Error(
      'GitHub 연동 환경변수(VITE_GITHUB_OWNER / VITE_GITHUB_REPO / VITE_GITHUB_TOKEN)가 설정되지 않았습니다. .env 파일을 확인해주세요.',
    )
  }
}

function rawUrl() {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${DATA_PATH}`
}

function contentsApiUrl() {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`
}

// 한글 등 멀티바이트 문자를 안전하게 base64로 인코딩/디코딩
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

export async function fetchRemoteData() {
  assertConfigured()
  const res = await fetch(`${rawUrl()}?t=${Date.now()}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })
  if (res.status === 404) {
    return { ...EMPTY_DATA }
  }
  if (!res.ok) {
    throw new Error(`data.json을 불러오지 못했습니다. (HTTP ${res.status})`)
  }
  const text = await res.text()
  if (!text.trim()) return { ...EMPTY_DATA }
  try {
    const json = JSON.parse(text)
    return {
      orders: Array.isArray(json.orders) ? json.orders : [],
      inventory: json.inventory && typeof json.inventory === 'object' ? json.inventory : {},
      cancelReturns: Array.isArray(json.cancelReturns) ? json.cancelReturns : [],
      shippingInfo: json.shippingInfo && typeof json.shippingInfo === 'object' ? json.shippingInfo : {},
      updatedAt: json.updatedAt || null,
    }
  } catch {
    throw new Error('data.json 형식이 올바르지 않습니다.')
  }
}

async function getFileSha() {
  const res = await fetch(`${contentsApiUrl()}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`data.json 파일 정보를 조회하지 못했습니다. (HTTP ${res.status})`)
  }
  const json = await res.json()
  return json.sha
}

// GitHub Contents API는 PUT 시점의 sha가 "지금" 저장소에 있는 sha와 정확히
// 같아야 저장이 된다(낙관적 동시성 제어). 짧은 시간 안에 저장이 두 번 이상
// 걸리면(예: 여러 항목을 연달아 수정, 다른 탭에서 동시 작업 등) 먼저 끝난
// 저장이 sha를 바꿔버려서 나중 저장이 409로 실패한다. 이 경우 최신 sha를
// 다시 받아와 그대로 재시도하면 대부분 해결되므로 몇 차례 자동 재시도한다.
const SAVE_RETRY_COUNT = 3

export async function saveRemoteData({ orders, inventory, cancelReturns, shippingInfo }) {
  assertConfigured()
  const payload = {
    orders: orders || [],
    inventory: inventory || {},
    cancelReturns: cancelReturns || [],
    shippingInfo: shippingInfo || {},
    updatedAt: new Date().toISOString(),
  }
  const content = utf8ToBase64(JSON.stringify(payload, null, 2))

  let lastError = null
  for (let attempt = 1; attempt <= SAVE_RETRY_COUNT; attempt++) {
    const sha = await getFileSha()
    const body = {
      message: `chore: data.json 업데이트 (${payload.updatedAt})`,
      content,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }

    const res = await fetch(contentsApiUrl(), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (res.ok) return payload

    if (res.status === 409 && attempt < SAVE_RETRY_COUNT) {
      lastError = new Error('data.json이 그 사이 다른 곳에서 저장되어 최신 버전으로 다시 시도합니다.')
      continue
    }

    const errText = await res.text().catch(() => '')
    throw new Error(`data.json 저장에 실패했습니다. (HTTP ${res.status}) ${errText}`)
  }
  throw lastError
}
