import { useRef, useState } from 'react'
import ColumnMappingPreview from './ColumnMappingPreview'

// 범용 엑셀 업로드 버튼. parseFn은 { [recordsKey]: [...], meta } 형태를
// 반환하는 비동기 함수(예: parseOrderExcelFile, parseCancelReturnExcelFile)면
// 어떤 것이든 연결해서 재사용할 수 있다.
export default function ExcelUploadButton({ label = '📄 파일로 정보입력', recordLabel = '데이터', recordsKey, parseFn, onImport }) {
  const inputRef = useRef(null)
  const [parsing, setParsing] = useState(false)
  const [pending, setPending] = useState(null) // { fileName, records, meta }
  const [parseError, setParseError] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
    if (!file) return

    // 이 사이트는 별도 로그인/권한 보호가 없는 공개 페이지라, 실수로
    // 개인정보가 들어있는 원본 파일을 그대로 올리지 않도록 업로드 직전에
    // 한 번 더 확인을 받는다.
    const confirmed = window.confirm(
      '이 페이지는 보호되지 않아, 개인정보를 올릴 경우 대단한 큰일이 납니다. 꼭 제작자가 준비한 엑셀 파일만 업로드 해주세요.',
    )
    if (!confirmed) return

    setParsing(true)
    setParseError(null)
    try {
      const result = await parseFn(file)
      const records = result[recordsKey]
      const meta = result.meta
      if (meta.missingFields.length > 0) {
        setParseError(`다음 항목의 열을 찾을 수 없습니다: ${meta.missingFields.join(', ')}`)
      }
      setPending({ fileName: file.name, records, meta, raw: result })
    } catch (err) {
      setParseError(err.message || String(err))
    } finally {
      setParsing(false)
    }
  }

  const handleConfirm = async () => {
    if (!pending) return
    setSaving(true)
    try {
      // raw는 parseFn이 반환한 전체 결과다. 대부분의 화면은 records만 있으면
      // 충분하지만(recordsKey로 뽑은 배열), 주문 파일처럼 여러 종류의 데이터를
      // 한 번에 뽑아내는 경우(예: 교재 주문 + 네이버 이벤트 주문건) onImport가
      // 필요한 나머지 값을 raw에서 꺼내 쓸 수 있게 함께 넘긴다.
      // onImport가 GitHub 저장 성공 여부(boolean)를 반환하면 그걸로 실제
      // 저장까지 끝났는지 확인한다. 저장이 실패하면(false) 팝업을 닫지
      // 않고 그대로 두어, 담당자가 "이대로 가져오기"를 다시 눌러 재시도할
      // 수 있게 한다 — 그냥 닫아버리면 화면엔 반영됐지만 GitHub에는
      // 저장되지 않아, 새로고침하면 방금 올린 내용이 사라진 것처럼 보인다.
      const result = await onImport(pending.records, pending.raw)
      if (result === false) {
        window.alert(
          '파일 내용은 화면에 반영됐지만, GitHub 저장에는 실패했습니다.\n상단의 오류 메시지를 확인하고 "이대로 가져오기"를 다시 눌러주세요. 저장에 성공하기 전까지는 새로고침하지 마세요.',
        )
        return
      }
      setPending(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button type="button" className="btn btn--primary" onClick={() => inputRef.current?.click()} disabled={parsing}>
        {parsing ? '파일 분석 중...' : label}
      </button>
      {parseError && !pending && (
        <span style={{ color: 'var(--color-danger)', fontSize: 12, marginLeft: 8 }}>{parseError}</span>
      )}
      {pending && (
        <ColumnMappingPreview
          meta={pending.meta}
          fileName={pending.fileName}
          recordLabel={recordLabel}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
          confirming={saving}
        />
      )}
    </>
  )
}
