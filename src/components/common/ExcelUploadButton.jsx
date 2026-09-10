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
      setPending({ fileName: file.name, records, meta })
    } catch (err) {
      setParseError(err.message || String(err))
    } finally {
      setParsing(false)
    }
  }

  const handleConfirm = async () => {
    if (!pending) return
    await onImport(pending.records)
    setPending(null)
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
        />
      )}
    </>
  )
}
