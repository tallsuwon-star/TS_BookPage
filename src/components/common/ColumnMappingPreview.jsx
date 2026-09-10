import * as XLSX from 'xlsx'
import './ColumnMappingPreview.css'

export default function ColumnMappingPreview({ meta, fileName, recordLabel = '데이터', onConfirm, onCancel }) {
  const fieldDefs = meta.fieldDefs

  return (
    <div className="mapping-modal__backdrop" role="dialog" aria-modal="true">
      <div className="mapping-modal">
        <h3>엑셀 열 매핑 확인</h3>
        <p className="mapping-modal__desc">
          <strong>{fileName}</strong> · 시트 <strong>{meta.sheetName}</strong> · 인식된 {recordLabel}{' '}
          {meta.totalRows.toLocaleString('ko-KR')}건
          {meta.skippedNonTextbook > 0 && (
            <> · 교재가 아닌 상품(화상영어 수강권, 체험/이벤트 등) {meta.skippedNonTextbook.toLocaleString('ko-KR')}건 제외됨</>
          )}
        </p>

        {meta.warnings.length > 0 && (
          <div className="mapping-modal__warning">
            {meta.warnings.map((w) => (
              <p key={w}>⚠ {w}</p>
            ))}
          </div>
        )}

        <table className="mapping-modal__table">
          <thead>
            <tr>
              <th>집계 항목</th>
              <th>매핑된 열</th>
              <th>원본 헤더 문구</th>
            </tr>
          </thead>
          <tbody>
            {fieldDefs.map((field) => {
              const idx = meta.mapping[field.key]
              const found = idx != null && idx >= 0
              return (
                <tr key={field.key}>
                  <td>{field.label}</td>
                  <td>{found ? `${XLSX.utils.encode_col(idx)}열` : '-'}</td>
                  <td className={found ? '' : 'mapping-modal__missing'}>
                    {found ? String(meta.headerRow[idx] ?? '(빈 헤더)') : '찾지 못함'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mapping-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            이대로 가져오기
          </button>
        </div>
      </div>
    </div>
  )
}
