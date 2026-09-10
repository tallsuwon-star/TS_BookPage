import * as XLSX from 'xlsx'
import {
  FIELD_DEFS,
  CANCEL_RETURN_FIELD_DEFS,
  ORDER_EXTRA_FIELD_DEFS,
  NAVER_EXPORT_MIN_COLUMNS,
  isTextbookProduct,
} from './columnAliases'
import { toISODate } from './dateUtils'

// 네이버 발주발송관리 파일은 시트의 "!ref"(사용 범위)가 실제 데이터보다
// 좁게 잡혀 내려오는 경우가 있어, 항상 A~BK(63열)까지는 강제로 읽어
// 뒤쪽 열(예: R열 상품가격)이 잘리지 않도록 한다.
function sheetToRows(worksheet) {
  const ref = worksheet['!ref']
  const range = ref ? XLSX.utils.decode_range(ref) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
  if (range.e.c < NAVER_EXPORT_MIN_COLUMNS - 1) {
    range.e.c = NAVER_EXPORT_MIN_COLUMNS - 1
  }
  return XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    range,
    defval: '',
    raw: true,
  })
}

// 상단에 제목/안내 행이 섞여 있을 수 있어, 필드 별칭과 가장 많이 일치하는
// 행을 헤더 행으로 판단한다. (앞 5행 이내로 가정)
function detectHeaderRowIndex(rows, fieldDefs) {
  const allAliases = fieldDefs.flatMap((f) => f.aliases)
  let bestIdx = 0
  let bestScore = -1
  const searchLimit = Math.min(rows.length, 5)
  for (let i = 0; i < searchLimit; i++) {
    const row = rows[i] || []
    const score = row.filter((cell) => {
      const text = String(cell ?? '').trim()
      return text && allAliases.some((alias) => text === alias || text.includes(alias))
    }).length
    if (score > bestScore) {
      bestScore = score
      bestIdx = i
    }
  }
  return bestIdx
}

export function detectColumnMapping(headerRow, fieldDefs) {
  const mapping = {}
  const warnings = []
  for (const field of fieldDefs) {
    let foundIndex = -1
    for (let i = 0; i < headerRow.length; i++) {
      const cell = String(headerRow[i] ?? '').trim()
      if (cell && field.aliases.includes(cell)) {
        foundIndex = i
        break
      }
    }
    if (foundIndex === -1) {
      for (let i = 0; i < headerRow.length; i++) {
        const cell = String(headerRow[i] ?? '').trim()
        if (cell && field.aliases.some((alias) => cell.includes(alias))) {
          foundIndex = i
          break
        }
      }
    }
    if (foundIndex === -1 && typeof field.fallbackColumnIndex === 'number') {
      foundIndex = field.fallbackColumnIndex
      warnings.push(
        `"${field.label}" 열을 헤더 문구로 찾지 못해 ${XLSX.utils.encode_col(foundIndex)}열을 기본값으로 사용했습니다. 아래 매핑을 확인해주세요.`,
      )
    }
    mapping[field.key] = foundIndex
  }
  return { mapping, warnings }
}

function parsePrice(rawValue) {
  if (typeof rawValue === 'number') return rawValue
  const digits = String(rawValue ?? '').replace(/[^0-9.-]/g, '')
  return Number(digits) || 0
}

// 엑셀 파싱 공통 파이프라인. fieldDefs로 어떤 열을 찾을지 정의하고,
// buildRecord(get, rowIndex, recordIndex)가 실제 레코드 객체를 만든다.
// buildRecord가 null을 반환하면 해당 행은 건너뛴다(합계/공백 행 등).
// extraFieldDefs는 있으면 쓰고 없어도 경고를 띄우지 않는 선택 항목(예: PII
// 열)을 위한 것으로, get()에서는 fieldDefs와 동일하게 조회할 수 있지만
// missingFields/warnings 계산에는 포함되지 않는다.
async function parseGenericExcelFile(file, fieldDefs, buildRecord, extraFieldDefs = []) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows = sheetToRows(worksheet)

  const headerRowIndex = detectHeaderRowIndex(rows, fieldDefs)
  const headerRow = rows[headerRowIndex] || []
  const { mapping, warnings } = detectColumnMapping(headerRow, fieldDefs)
  const missingFields = fieldDefs.filter((f) => mapping[f.key] == null || mapping[f.key] < 0).map((f) => f.label)
  const extraMapping =
    extraFieldDefs.length > 0 ? detectColumnMapping(headerRow, extraFieldDefs).mapping : {}
  const combinedMapping = { ...mapping, ...extraMapping }

  const get = (row, key) => {
    const idx = combinedMapping[key]
    if (idx == null || idx < 0) return ''
    return row[idx]
  }

  const records = []
  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.every((cell) => cell === '' || cell == null)) continue
    const record = buildRecord((key) => get(row, key), r, records.length)
    if (record) records.push(record)
  }

  return {
    records,
    meta: {
      sheetName,
      headerRowIndex,
      headerRow,
      mapping,
      warnings,
      missingFields,
      totalColumns: headerRow.length,
      totalRows: records.length,
      fieldDefs,
    },
  }
}

// ⚠️ 주문자명/연락처/이메일/주문번호/주소는 팀에서 업로드하는 파일이 항상
// 사전에 가명·임의값으로 치환되어 있다는 전제로 마스킹 없이 그대로
// 읽어들인다(columnAliases.js의 ORDER_EXTRA_FIELD_DEFS 주석 참고). 실제
// 회원 개인정보가 담긴 파일을 올리게 되는 시점이 오면 이 부분을 반드시
// 다시 마스킹하거나 제거해야 한다.
export async function parseOrderExcelFile(file) {
  let skippedNonTextbook = 0
  const { records, meta } = await parseGenericExcelFile(
    file,
    FIELD_DEFS,
    (get, r, i) => {
      const productName = String(get('productName') || '').trim()
      if (!productName) return null // 합계/공백 행 등 상품명이 없는 행은 제외

      // 발주발송관리 파일에는 화상영어 수강권, 10원 체험/3+1 이벤트 등
      // 교재가 아닌 상품 주문도 함께 섞여 내려온다. 상품명에 교재 키워드가
      // 없으면 "교재상품 결제확인" 집계 대상에서 제외한다.
      if (!isTextbookProduct(productName)) {
        skippedNonTextbook += 1
        return null
      }

      return {
        id: `row${r}-${i}`,
        orderDate: toISODate(get('orderDate')),
        productName,
        quantity: Number(get('quantity')) || 0,
        price: parsePrice(get('price')),
        channel: String(get('channel') || '').trim(),
        deliveryStatus: String(get('deliveryStatus') || '').trim(),
        orderNumber: String(get('orderNumber') || '').trim(),
        buyerName: String(get('buyerName') || '').trim(),
        phone: String(get('phone') || '').trim(),
        email: String(get('email') || '').trim(),
        address: String(get('address') || '').trim(),
      }
    },
    ORDER_EXTRA_FIELD_DEFS,
  )
  return { orders: records, meta: { ...meta, skippedNonTextbook } }
}

// 네이버 "취소/반품/교환 관리" 다운로드 파일용 파서.
// ⚠️ 회원 이름/연락처 등 개인정보 열은 파일에 있더라도 절대 추출하지 않는다.
export async function parseCancelReturnExcelFile(file) {
  let skippedNonTextbook = 0
  const { records, meta } = await parseGenericExcelFile(file, CANCEL_RETURN_FIELD_DEFS, (get, r, i) => {
    const productName = String(get('productName') || '').trim()
    if (!productName) return null

    if (!isTextbookProduct(productName)) {
      skippedNonTextbook += 1
      return null
    }

    return {
      id: `cr-row${r}-${i}`,
      claimDate: toISODate(get('claimDate')),
      productName,
      quantity: Number(get('quantity')) || 0,
      claimType: String(get('claimType') || '').trim() || '미지정',
      reason: String(get('reason') || '').trim(),
      status: String(get('status') || '').trim(),
      channel: String(get('channel') || '').trim(),
    }
  })
  return { cancelReturns: records, meta: { ...meta, skippedNonTextbook } }
}
